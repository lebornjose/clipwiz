import { Editor } from "../index"
import { ITextTrackItem } from "@clipwiz/shared"
import { TIME_CONFIG } from "@clipwiz/shared"

export const addTextNode = (editor: Editor, trackId: string, item: ITextTrackItem) => {
  const textNode = editor.videoCtx.canvas(editor.pag.pagCanvas);
  textNode.id = item.id
  textNode.trackId = trackId
  textNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  textNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  textNode.connect(editor.videoCtx.destination)
}
