import type { IPhotoNode, IPhotoTrackItem } from '@van-gogh/video-render-constants'
import { LAYER_RENDERER_TYPE, MATERIAL_TYPE, timeConfig } from '@van-gogh/video-render-constants'
import commandFunc from '../../../common/index'
import type { Editor } from '../index'
import convertEndTime from '../utils/convertEndTime'

export const addPhoto = (editor: Editor, trackId: string, item: IPhotoTrackItem) => {
  return new Promise((resolve) => {
    if (item.startTime >= editor.totalTime) {
      resolve(true)
      return
    }
    let photoNode: IPhotoNode
    if (item.format === MATERIAL_TYPE.GIF) {
      photoNode = editor.videoCtx.canvas(document.createElement('canvas')) as IPhotoNode
      photoNode.url = item.url
    } else {
      photoNode = editor.videoCtx.image(item.url)
    }
    photoNode.id = item.id
    photoNode.trackId = trackId
    photoNode.materialId = item.materialId || item.id
    photoNode.type = MATERIAL_TYPE.PHOTO
    photoNode.metaData = item
    photoNode.format = item.format
    photoNode.pipParams = commandFunc.layerParams(item, LAYER_RENDERER_TYPE.PHOTO)
    photoNode.start(item.startTime / timeConfig.MILL_TIME_CONVERSION)
    const stopTime = convertEndTime(item.endTime, editor.totalTime)
    photoNode.stop(stopTime / timeConfig.MILL_TIME_CONVERSION)
    photoNode.connect(editor.videoCtx.destination)

    photoNode.registerCallback('seek', () => {
      requestAnimationFrame(() => {
        editor.movie?.renderer?.hideOutOfRangeImageLayers(editor.currentTime)
      })
    })

    photoNode.registerCallback('ended', () => {
      if (editor.currentTime < editor.videoCtx.duration) {
        // 视频ended事件删除后，下一帧还没有马上渲染出来，放在下一帧隐藏
        requestAnimationFrame(() => {
          editor.movie?.renderer?.displayLayer(photoNode.id, false)
        })
      }
    })
    if (item.format !== MATERIAL_TYPE.GIF) {
      const loadEnd = () => {
        photoNode.unregisterCallback(loadEnd)
        resolve(true)
      }
      photoNode.registerCallback('loaded', loadEnd)
    } else {
      resolve(true)
    }
    editor.movie?.renderer?.getOrCreateTrackNode(photoNode)
  })
}
