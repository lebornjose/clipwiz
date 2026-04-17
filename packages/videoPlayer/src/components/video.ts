import type {IVideoTrackItem, IVideoNode } from '@clipwiz/shared'
import { MATERIAL_TYPE, TIME_CONFIG } from '@clipwiz/shared'
import { Editor } from '../index'
import { convertEndTime } from '../utils'


// let videoWaiting = 0 // 上报视频因为加载导致的loading 时间
// let videoSeekTime = 0 //  上报视频seek到可播放的时间

export const addVideoNode = (editor: Editor, trackId: string, item: IVideoTrackItem) => {
  let videoNode: IVideoNode
  if (item.startTime >= editor.totalTime) {
    return
  }
  if ([MATERIAL_TYPE.VIDEO].includes(item.format as MATERIAL_TYPE)) {
    videoNode = editor.videoCtx.video(item.url!, (item.fromTime) / 1000, 4, {
      volume: item.hide ? 0 : (item.volume || 0),
    })
    // TODO 如果为视频且为保留原生，则该视频volume 为0, 视频
    videoNode.playbackRate = Math.min(item.playRate, 4)
    videoNode.sound = item.volume || 0
    videoNode.soundtrack = item.soundtrack || 0
    const starTime = (item.startTime) / TIME_CONFIG.MILL_TIME_CONVERSION
    videoNode.start(starTime)
    // const stopTime:number = item.startTime + (item.duration / item.playRate)
    // 计算出视频可以播放出的总长度
    let videoTotal = (item.toTime - item.fromTime)
    const endTime: number = Math.min(Math.ceil(videoTotal / item.playRate + item.startTime), item.endTime)
    const stopTime = convertEndTime(endTime, editor.totalTime)
    videoNode.stop(stopTime / TIME_CONFIG.MILL_TIME_CONVERSION)
    videoNode.total = (endTime - item.startTime) / TIME_CONFIG.MILL_TIME_CONVERSION
    videoNode.muted = item.muted ?? true
  } else {
    videoNode = editor.videoCtx.image(item.url!) as unknown as IVideoNode
    videoNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
    videoNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  }
  videoNode.metaData = item
  videoNode.id = item.id
  videoNode.format = item.format
  videoNode.type = MATERIAL_TYPE.VIDEO
  videoNode.trackId = trackId

  if (item.transform) {
    const halfW = (item.width ?? 1920) / 2
    const halfH = (item.height ?? 1080) / 2
    ;(videoNode as any).setTransform({
      scale: item.transform.scale[0] ?? 1,
      x: (item.transform.translate[0] ?? 0) / halfW,
      y: (item.transform.translate[1] ?? 0) / halfH,
    })
  }

  ;(videoNode as any).connect(editor.videoCtx.destination, 0)
  videoNode.registerCallback('loaded', () => {
    if (editor.videoCtx.currentTime >= videoNode.startTime && editor.videoCtx.currentTime <= videoNode.stopTime) {
      if (editor.isWaiting) {
        editor.isWaiting = false
        editor.setState({ loading: false })
        editor.play()
      }
    }
  })

  return videoNode
}
