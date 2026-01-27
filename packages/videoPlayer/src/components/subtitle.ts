import { Editor } from "../index"
import { ISubtitleTrackItem } from "@clipwiz/shared"
import { TIME_CONFIG } from "@clipwiz/shared"

export const addSubtitleNode = (editor: Editor, trackId: string, item: ISubtitleTrackItem) => {
  const subtitleNode = editor.videoCtx.canvas(editor.pag.pagCanvas);
  subtitleNode.id = item.id
  subtitleNode.trackId = trackId
  subtitleNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  subtitleNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  subtitleNode.connect(editor.videoCtx.destination)
  // subtitleNode.registerCallback('loaded', () => {
  setTimeout(() => {
    editor.pag.updateTextLayers('这是测试字幕')
  }, 500);
  // })

}
