import { type IAudioTrackItem, timeConfig } from '@van-gogh/video-render-constants'
import type { Editor } from '../index'

export const addSound = (editor: Editor, trackId: string, item: IAudioTrackItem) => {
  if (item.startTime >= editor.totalTime) {
    return
  }
  const audioNode = editor.videoCtx.audio(item.url, item.fromTime / timeConfig.MILL_TIME_CONVERSION, 4, {
    volume: item.volume ?? 1,
  })
  audioNode.id = item.id
  audioNode.trackId = trackId
  audioNode.muted = false
  audioNode.start(item.startTime / timeConfig.MILL_TIME_CONVERSION)
  audioNode.stop(item.endTime / timeConfig.MILL_TIME_CONVERSION)
  audioNode.sound = item.volume
  audioNode.connect(editor.videoCtx.destination)
}
