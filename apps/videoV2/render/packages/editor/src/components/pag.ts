import type { IPhotoTrackItem, ISubtitleTrackItem } from '@van-gogh/video-render-constants'
import { LAYER_RENDERER_TYPE, timeConfig } from '@van-gogh/video-render-constants'
import commandFunc from '../../../common/index'
import type { Editor } from '../index'

export const addPag = (editor: Editor, trackId: string, item: ISubtitleTrackItem | IPhotoTrackItem) => {
  if (item.startTime >= editor.totalTime) {
    return
  }
  const pagNode = editor.videoCtx.canvas(document.createElement('canvas'))
  pagNode.id = item.id
  pagNode.trackId = trackId
  pagNode.materialId = item.materialId || ''
  pagNode.metaData = item
  pagNode.url = item.url
  pagNode.type = item.format || 'subtitle'
  pagNode.pipParams = commandFunc.layerParams(item, LAYER_RENDERER_TYPE.SUBTITLE)
  pagNode.start(item.startTime / timeConfig.MILL_TIME_CONVERSION)
  pagNode.stop(item.endTime / timeConfig.MILL_TIME_CONVERSION)
  pagNode.connect(editor.videoCtx.destination)

  pagNode.registerCallback('seek', () => {
    requestAnimationFrame(() => {
      if (editor.currentTime >= pagNode.startTime && editor.currentTime <= pagNode.stopTime) {
        editor.movie?.renderer?.hideNonMatchingSubtitles(pagNode)
      }
    })
  })
  pagNode.registerCallback('ended', () => {
    if (editor.currentTime < editor.videoCtx.duration) {
      editor?.movie?.renderer?.displayLayer(pagNode.id, false)
      // 这个是因为在替换字幕新增字幕的时候，回出发ended，导致字幕被隐藏了，字幕用的还都是同一个materialId, 所以隐藏之后需要在画一次当前的
      editor.queueDraw()
    }
  })
  editor.movie?.renderer?.getOrCreateTrackNode(pagNode)
}
