import { type ICommandContext, type ISourceNode, type IVideoNode, type IVideoTrackItem } from '@van-gogh/video-render-constants'
import type { Palette, Transition } from '@van-gogh/video-editor-shared'
import { addVideoNode, updateTransitionImage } from '../../components/video'
import type { Editor } from '../../index'

const defaultPalette: Palette = {
  temperature: 6550,
  hue: 0,
  saturation: 0,
  brightness: 0,
  contrast: 0,
  highLight: 0,
  shadow: 0,
  particle: 0,
  sharpen: 0,
  fade: 0,
  corner: 0,
  status: 'ON', // "OFF"表示关闭调色, "ON"表示开启调色
}

export const displayVideo = (editor: Editor, msg: ICommandContext, operate: boolean) => {
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === msg.content.id)
  if (!node) {
    throw new Error('无法找到素材')
  }
  const item: IVideoTrackItem = msg.content as IVideoTrackItem
  node.hide = operate
  node.metaData = Object.assign(node.metaData, item)
  editor.movie?.renderer?.displayLayer(node.id, !operate)
  editor.queueDraw()
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}

const createdTransition = (editor:Editor, node:ISourceNode, transitionIn: Transition) => {
  const transitionOut = {
    ...transitionIn,
    relativeStartTime: 0,
    relativeEndTime: transitionIn?.duration / 2
  }
  editor.movie?.renderer.getOrCreateTransition(node, transitionIn, transitionOut)
}

const updateTransition = (editor: Editor, node: IVideoNode, item: IVideoTrackItem, key: 'transitionOut' | 'transitionIn') => {
  if (key === 'transitionOut') {
    if (!item[key]) {
      node.removeTransition()
      delete node.pipParams.transitionOut
    } 
  } else {
    if (!item[key]) {
      delete node.pipParams.transitionIn
    }
    // 如果当前视频没有转场，且添加的有转场，需要添加转场
    if(!node.pipParams[key] && item[key]) {
      node.pipParams[key] = item[key]
      const transitionIn = item[key]
      createdTransition(editor, node, transitionIn)
    }
  }
  if(item['transitionIn']) {
    let transitionIn = item['transitionIn']
    const currentTransitionIn = node.pipParams['transitionIn']
    if(currentTransitionIn) {
      // 如果当前转场id不等于新修改的转场id，则为替换转场
      if(currentTransitionIn?.effectId !== transitionIn.effectId) {
        // TODO 很沙雕，如果替换转场需要把原来的转场删掉，然后在新增，离谱，不能理解
        editor.movie?.renderer?.removeTransition(currentTransitionIn.effectId)
        createdTransition(editor, node, transitionIn)
      } else {
        editor.movie?.renderer?.updateCmp2Transition('in', transitionIn)
      }
    }
    node.pipParams[key] = transitionIn

  }
  if(item['transitionOut']) {
    let transitionOut = item['transitionOut']
    const currentTransitionOut = node.pipParams['transitionOut']
    if(currentTransitionOut?.effectId === transitionOut.effectId) {
      editor.movie?.renderer?.updateCmp2Transition('out', transitionOut)
    }
    node.pipParams[key] = transitionOut
    node.addTransition()
  }
  node.metaData = Object.assign(node.metaData, item)
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}
// 更改素材类型
const updateFormat = (editor: Editor, node: IVideoNode, item: IVideoTrackItem) => {
  node.destroy()
  const trackItem = { ...node.metaData, ...item }
  addVideoNode(editor, node.trackId, trackItem)
}

export const updateVideoParams = (editor: Editor, msg: ICommandContext) => {
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === msg.content.id) as IVideoNode
  if (!node) {
    // throw new Error('无法找到素材')
    console.error('无法找到素材', msg)
    return
  }
  const item: IVideoTrackItem = msg.content as IVideoTrackItem
  let key: keyof IVideoTrackItem
  for (key in item) {
    if (key === 'id') {
      continue
    }
    if (key === 'format' && item.format && node.format !== item.format) {
      delete editor.imageCatch[`imageCatch${item.id}`]
      editor.movie?.renderer.removeLayer(node)
      updateFormat(editor, node, item)
      continue
    }
    if (['transitionIn', 'transitionOut'].includes(key)) {
      updateTransition(editor, node, item, key as 'transitionIn' | 'transitionOut')
      continue
    }
    if (key === 'fromTime') {
      if (item.url) {
        node.sourceOffset = (item[key]) / 1000
      } else {
        node.sourceOffset = (item[key]) / 1000
      }
      node.metaData.fromTime = item[key]
      updateTransitionImage(node, {
        ...node.metaData,
        url: node.elementURL,
      }, editor)
    }
    if (key === 'palette') {
      node.pipParams[key] = item.palette || defaultPalette
      editor.movie?.renderer?.setImageLut(item.palette || defaultPalette, node)
      continue
    }
    if (key === 'url') {
      node.elementURL = item[key]
      if (item.format === 'image' && item.id) {
        delete editor.imageCatch[`imageCatch${item.id}`]
      }
      if (item?.segmentEndTime) {
        const duration = item.segmentEndTime - item.segmentStartTime!
        node.metaData.duration = duration
        node.metaData.segmentEndTime = item.segmentEndTime
        node.metaData.segmentStartTime = item.segmentStartTime
      }
      if (item?.fromTime) {
        node.metaData.fromTime = item.fromTime
      }
      if (item?.toTime) {
        node.metaData.toTime = item.toTime
      }
      item.crop && (node.pipParams.crop = item.crop)
      item.width && (node.pipParams.width = item.width)
      item.height && (node.pipParams.height = item.height)
      updateTransitionImage(node, {
        ...node.metaData,
        url: node.elementURL,
      }, editor)
      continue
    }
    if (key === 'playRate') {
      node.playbackRate = item[key]
      // 最大可播放时间长度
      const overTime = node.metaData.segmentEndTime
      const duration = node.metaData.duration
      const endTime = node.metaData.endTime / 1000
      // 如果可播放长度大于最大可播放长度， 直接等于坑位结束时间
      if (overTime && (item.fromTime + (duration / node.playbackRate)) < overTime) {
        node.stopTime = endTime
      } else {
        // 算一个最大播放值
        const maxDuration = (duration / node.playbackRate) / 1000
        const stopTime = node._startTime + maxDuration
        node.stopTime = Math.min(stopTime, endTime)
      }
      updateTransitionImage(node, {
        ...node.metaData,
        url: node.elementURL,
      }, editor)
    }
    if (key === 'volume') {
      node.volume = item[key]
      continue
    }

    if (key === 'commonEffects') {
      node.commonEffects = item[key]
      continue
    }
    // @ts-ignore
    node.pipParams && (node.pipParams[key] = item[key as keyof IVideoTrackItem])
  }
  node.metaData = Object.assign(node.metaData, item)
  editor.queueDraw()
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}
