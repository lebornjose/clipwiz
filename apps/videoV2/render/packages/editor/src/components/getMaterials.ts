import { MATERIAL_TYPE } from '@van-gogh/video-render-constants'
import type { IMaterials, ISourceNode, IVideoNode, IVideoTrackItem } from '@van-gogh/video-render-constants'
import type { Editor } from '../index'
import { getBufferImage, getGifImage } from './getBufferImage'
import clonedeep  from 'lodash.clonedeep'

const getSubtitle = (editor: Editor) => {
  const currentTime = editor.currentTime
  const sourceNodes = editor.videoCtx._sourceNodes
  // type 为pag 为字幕
  const nodes = sourceNodes.filter((item) => {
    return currentTime >= item.startTime && currentTime < item.stopTime && item.type === MATERIAL_TYPE.SUBTITLE
  })
  if (nodes.length) {
    const id = `${nodes[0].id}`
    if (id && nodes.length === 1 && editor.pagSources[`pagSources${id}`]) {
      const item = nodes[0]
      return {
        pag: editor.pagSources[`pagSources${id}`],
        type: item.type,
        node: item,
        currentTime,
      }
    }
  }
  // 同时不能同时存在有多个字幕
  for (let i = 0; i < nodes.length - 1; i++) {
    const item = nodes[i]
    const nextItem = nodes[i + 1]
    if (item._stopTime === nextItem._startTime && editor.pagSources[`pagSources${nextItem.id}`]) {
      return {
        pag: editor.pagSources[`pagSources${nextItem.id}`],
        type: nextItem.type,
        node: nextItem,
        currentTime,
      }
    }
  }
}

const getCommonEffect = (editor: Editor, url: string) => {
  const source = editor.commonEffectSources[url]
  if (!source) {
    return fetch(url).then(e => e.text()).then((e) => {
      editor.commonEffectSources[url] = e
      return e
    })
  }
  return source
}

// 获取当前时间的所有素材文件
const getMaterials = (editor: Editor, cb: (arr: Array<IMaterials>) => void) => {
  const currentTime = editor.currentTime
  const sourceNodes = editor.videoCtx._sourceNodes
  const videoNodes = sourceNodes.filter(item => item.type === MATERIAL_TYPE.VIDEO)
  const nodes: ISourceNode[] = []
  sourceNodes.forEach((item) => {
    if( currentTime >= item.startTime && currentTime < item.stopTime && item._elementType !== 'audio' && item.type !== 'subtitle') {
      if(item.type ===  MATERIAL_TYPE.VIDEO) {
        const videoItem = (item as IVideoNode).metaData as IVideoTrackItem
        if(videoItem.transitionIn && currentTime > (item.stopTime - (videoItem.transitionIn.duration / 1000 / 2))) {
          const nextVideo = videoNodes.find((child)  => {
            const next = (child as IVideoNode).metaData as IVideoTrackItem
            if(videoItem.transitionIn?.effectId === next.transitionOut?.effectId) {
              return child
            }
          })
          // 如果该视频有转场入场，需要获取下一个片段的画面，这里是后去下一帧画面的方法
          if(nextVideo) {
            const nextNode = clonedeep(nextVideo)
            nextNode.metaData.hide = true
            delete nextNode.pipParams.transitionIn
            delete nextNode.pipParams.transitionOut
            nodes.push(item)
            nodes.push({
              ...nextNode,
              imageData: nextNode?.transitionData?.in,
              hide: true
            })
          }
        } else if(videoItem.transitionOut && currentTime < (item.startTime + (videoItem.transitionOut.duration /1000 / 2))) {
          const prevVideo = videoNodes.find((child)  => {
            const prev = (child as IVideoNode).metaData as IVideoTrackItem
            if(videoItem.transitionOut?.effectId === prev.transitionIn?.effectId) {
              return child
            }
          })
           // 如果该视频有转场出场，需要获取上一个片段的画面，这里是去上一帧画面的方法
          if(prevVideo) {
            let prevNode = clonedeep(prevVideo)
            prevNode.metaData.hide = true
            delete prevNode.pipParams.transitionIn
            delete prevNode.pipParams.transitionOut
            nodes.push({
              ...prevVideo,
              imageData: prevNode?.transitionData?.out
            })
            nodes.push(item)
          }
        } else  {
          nodes.push(item)
        }
      } else {
        nodes.push(item)
      }
    }
  })
  const arr: Array<IMaterials> = []
  const promiseList = [] as (Promise<any>)[]
  nodes.forEach((item, index) => {
    if (item.type === MATERIAL_TYPE.TEXT) {
      editor.pagSources[`pagSources${item.id}`] && arr.push({
        pag: editor.pagSources[`pagSources${item.id}`],
        type: 'text',
        node: item,
        currentTime,
      })
    } else if (item.type === MATERIAL_TYPE.PHOTO) {
      if (item.format === MATERIAL_TYPE.GIF) {
        const data = getGifImage(editor, item, editor.gifCanvasEl)
        if (data instanceof Promise) {
          promiseList.push(data.then(url => url && (arr[index] = ({
            imageData: url,
            node: nodes[index],
            type: 'photo',
            currentTime,
          }))))
        } else {
          data && (arr[index] = ({
            imageData: data,
            node: item,
            type: 'photo',
            currentTime,
          }))
        }
      } else {
        const url = getBufferImage(editor, item, editor.canvasEl)
        url && (arr[index] = ({
          imageData: url,
          node: item,
          type: 'photo',
          currentTime,
        }))
      }
    } else {
      const url = getBufferImage(editor, item, editor.canvasEl)
      if (url) {
       
        arr[index] = {
          imageData: url,
          node: item,
          type: 'img',
          currentTime,
        }
        if ('commonEffects' in item && item.commonEffects) {
          const commonEffects = item.commonEffects.map(e => ({ ...e, source: [] as string[] }))
          const pList = [] as (Promise<any>)[]
          item.commonEffects.forEach((e, i) => e.fragCodeList.forEach((url, j) => {
            const p = getCommonEffect(editor, url)
            if (p instanceof Promise) {
              pList.push(p.then(u => commonEffects[i].source[j] = u))
            } else {
              commonEffects[i].source[j] = p
            }
          }))
          promiseList.push(Promise.all(pList).then(() => arr[index].commonEffects = commonEffects).catch(() => {}))
        }
      }
    }
  })
  const subtitle = getSubtitle(editor) as IMaterials
  if (promiseList.length) {
    Promise.allSettled(promiseList).then(() => {
      subtitle && arr.push(subtitle)
      cb(arr.filter(item => item))
    }).catch(() => {})
  } else {
    subtitle && arr.push(subtitle)
    cb(arr.filter(item => item))
  }
  // TODO 这个是为了解决贴图遮挡住字幕的问题，但是产品说不用解决
  // const inx = arr.findIndex((row) => {
  //   return row.type === 'pag'
  // })
  // if (inx !== arr.length - 1) {
  //   arr.push(arr[inx])
  //   arr.splice(inx, 1)
  // }
}

export default getMaterials
