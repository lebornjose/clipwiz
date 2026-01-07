// 贴图
import type { IPhotoNode, ISourceNode } from '@van-gogh/video-render-constants'
import { type ICommandContext, type INode, type IPhotoTrackItem, MATERIAL_TYPE } from '@van-gogh/video-render-constants'
import { addPhoto } from '../../components/photo'
import type { Editor } from '../../index'
import convertEndTime from '../../utils/convertEndTime'

const pngToGif = async (editor: Editor, node: ISourceNode, msg: ICommandContext, type: number) => {
  const item: IPhotoTrackItem = msg.content as IPhotoTrackItem
  const photoItem: IPhotoTrackItem = {
    id: node.id,
    materialId: item.materialId,
    url: item.url,
    startTime: node._startTime * 1000,
    endTime: node._stopTime * 1000,
    hide: node.hide,
    format: type ? 'png' : 'gif',
    desc: '',
    width: item.width || 0,
    height: item.height || 0,
    transform: node.pipParams.transform,
    crop: node.pipParams.crop,
    duration: node.duration,
    scaleMode: 2,
  }
  node.destroy()
  editor.movie?.renderer.removeLayer(node)
  await addPhoto(editor, msg.trackId, photoItem)
  if (!type) {
    await editor.loadPhoto({ materialId: item.materialId, url: item.url })
  }
  editor.draw()
}

export const updatePhotoParams = async (editor: Editor, msg: ICommandContext) => {
  const node = editor.videoCtx._sourceNodes.find((child: INode) => child.id === msg.content.id) as IPhotoNode
  if (!node) {
    throw new Error('无法找到素材')
  }
  const item: IPhotoTrackItem = msg.content as IPhotoTrackItem
  for (const key in item) {
    if (key === 'id') {
      continue
    }
    if (key === 'url') {
      const extension = item.url.split('.').pop()
      if (node.format !== MATERIAL_TYPE.GIF && extension === MATERIAL_TYPE.GIF) {
        // 之前是静态图 现在换成gif贴图
        void pngToGif(editor, node, msg, 0)
        return
      }
      // 之前是gif 现在换成静态贴图
      if (node.format === MATERIAL_TYPE.GIF && extension !== MATERIAL_TYPE.GIF) {
        void pngToGif(editor, node, msg, 1)
        return
      }
      node.materialId = item.materialId || ''
      node.pipParams.materialId = item.materialId
      node.url = item.url
      if (extension === MATERIAL_TYPE.GIF) {
        await editor.loadPhoto({ materialId: item.materialId, url: item.url })
      }
    }
    if (key === 'startTime') {
      let startTime = item[key] / 1000
      if (startTime > editor.totalTime) {
        startTime = startTime - 10
        node.hide = true
        node.pipParams.hide = true
      } else {
        if (!node.metaData.hide) {
          node.hide = false
          node.pipParams.hide = false
        }
      }
      node.startTime = startTime
      continue
    }
    if (key === 'endTime') {
      const endTime = convertEndTime(item[key], editor.totalTime)
      node.stopTime = (endTime / 1000)
      continue
    }
    // @ts-ignore
    node.pipParams[key] = item[key as keyof IPhotoTrackItem]
  }
  // 同步metaData，保证协议最新
  node.metaData = Object.assign(node.metaData, item)
  editor.movie?.renderer?.displayLayer(node.id, false)
  editor.draw()
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}

export const displayPhoto = (editor: Editor, msg: ICommandContext, operate: boolean) => {
  const node = editor.videoCtx._sourceNodes.find((child: INode) => child.id === msg.content.id)
  if (!node) {
    throw new Error('无法找到素材')
  }
  const item: IPhotoTrackItem = msg.content as IPhotoTrackItem
  node.hide = operate
  node.metaData = Object.assign(node.metaData, item)
  node.pipParams.hide = operate
  editor.movie?.renderer?.displayLayer(node.id, !operate)
  editor.queueDraw()
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}

export const addToPhoto = async (editor: Editor, trackId: string, item: IPhotoTrackItem) => {
  await addPhoto(editor, trackId, item)
  // TODO 这个是为了解决贴图会盖住字幕的问题，但是产品说不用解决
  // const arr = editor.videoCtx._sourceNodes.filter((row) => {
  //   return editor.currentTime === row._startTime / 1000 && row.type === 'pag'
  // })
  // for (const node of arr) {
  //   editor.movie?.renderer.removePagLayer(node)
  //   delete editor.pagSources[`pagSources${node.materialId}`]
  //   await editor.loadItemPag({ materialId: node.materialId, url: node.url! })
  // }
  if (item.format === MATERIAL_TYPE.GIF) {
    await editor.loadPhoto({ materialId: item.materialId, url: item.url })
  }
}
