// 花子轨道
import type { INode, ITextNode, ITextTrackItem } from '@van-gogh/video-render-constants'
import { LAYER_RENDERER_TYPE, MATERIAL_TYPE } from '@van-gogh/video-render-constants'
import commandFunc from '../../../common/index'
import type { Editor } from '../index'

// 判断是否需要隐藏图层
// 必须大于当前时间，（或者大于结束时间切小于总时长）
const isRemoveNode = function (this: Editor, videoNode: INode) {
  if (
    this.currentTime < videoNode.startTime
    || (this.currentTime > videoNode.stopTime && this.currentTime < this.videoCtx.duration)
  ) {
    this.movie?.renderer?.displayLayer(videoNode.id, false)
  }
}

export const addText = (editor: Editor, trackId: string, item: ITextTrackItem) => {
  return new Promise((resolve) => {
    if (item.startTime >= editor.totalTime) {
      resolve(true)
    }
    editor.convertEndTime(item)
    const textNode = editor.videoCtx.canvas(document.createElement('canvas')) as ITextNode
    textNode.metaData = item
    textNode.id = item.id
    textNode.materialId = item.id
    textNode.trackId = trackId
    textNode.url = item.url
    textNode.type = MATERIAL_TYPE.TEXT
    textNode.pipParams = commandFunc.layerParams(item, LAYER_RENDERER_TYPE.TEXT)
    textNode.start(item.startTime / 1000)
    textNode.stop(item.endTime / 1000)
    textNode.connect(editor.videoCtx.destination)
    textNode.registerCallback('seek', () => {
      setTimeout(() => {
        isRemoveNode.call(editor, textNode)
      })
    })
    textNode.registerCallback('ended', () => {
      if (editor.currentTime < editor.videoCtx.duration) {
        console.log('ended')
        editor.movie?.renderer.displayLayer(textNode.id, false)
      }
    })
    editor.loadTextPag({ id: item.id, url: item.url }).then(() => {
      resolve(true)
    }).catch(() => { })
    editor.movie?.renderer?.getOrCreateTrackNode(textNode)
  })
}
