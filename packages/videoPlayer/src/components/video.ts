import type {IVideoTrackItem, IVideoNode, DestinationNode } from '@clipwiz/shared'
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
    // TODO 这个加1 是伟大的TL们讨论出的成本最低方案，
    // 这个bug 的起因是因为算法取出了完成的 pts_time 时间，某一帧的完整时间，因为后端因为在转化存储的流程中把小数都给丢了
    // 我也弄不明白为什么把丢的小数加上来成本就高了，高在哪里
    // 所有tl们集中讨论出的成本最小方案
    videoNode = editor.videoCtx.video(item.url, (item.fromTime + 1) / 1000, 4, {
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
    videoNode = editor.videoCtx.image(item.url) as unknown as IVideoNode
    videoNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
    videoNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  }
  videoNode.metaData = item
  videoNode.id = item.id
  videoNode.format = item.format
  videoNode.type = MATERIAL_TYPE.VIDEO
  videoNode.trackId = trackId
  videoNode.connect(editor.videoCtx.destination as DestinationNode)
  // videoNode.registerCallback('waiting', () => {
  //   if (editor.videoCtx.state !== STATE.PLAYING) {
  //     return
  //   }

  //   // videoWaiting = performance.now()
  //   editor.isWaiting = true
  //   editor.videoCtx.pause()
  //   // editor.setState({ loading: true })
  // })
  videoNode.registerCallback('loaded', () => {
    if (editor.videoCtx.currentTime >= videoNode.startTime && editor.videoCtx.currentTime <= videoNode.stopTime) {
      if (editor.isWaiting) {
        editor.isWaiting = false
        editor.setState({ loading: false })
        editor.play()
      }
    }
  })
}
