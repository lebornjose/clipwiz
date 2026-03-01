import type {IVideoTrackItem, IVideoNode, DestinationNode } from '@clipwiz/shared'
import { MATERIAL_TYPE, TIME_CONFIG } from '@clipwiz/shared'
import { Editor } from '../index'
import { convertEndTime } from '../utils'
import VideoContext from '../videocontext'


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
  if(item.transitionIn) { // 入场转场
    const crossFadeEffect = editor.videoCtx.transition(VideoContext.DEFINITIONS.DREAMFADE);
    const startTime = (item.endTime - 1000) / TIME_CONFIG.MILL_TIME_CONVERSION
    const endtime = (item.endTime) / TIME_CONFIG.MILL_TIME_CONVERSION
    crossFadeEffect.transition(startTime, endtime, 0.0, 1.0, "mix");
    // videoNode.connect(crossFadeEffect)
    editor.transitionMap.set(item.transitionIn.layerList.join('_'), crossFadeEffect)
  }
  if(item.transitionIn || item.transitionOut) {
    const transitionId = item.transitionOut?.layerList.join('_') || item.transitionIn?.layerList.join('_')
    videoNode.connect(editor.transitionMap.get(transitionId!))
  } else {
    videoNode.connect(editor.videoCtx.destination as DestinationNode)
  }
  if(item.transitionOut) {
    editor.transitionMap.get(item.transitionOut.layerList.join('_')).connect(editor.videoCtx.destination as DestinationNode)
  }
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
