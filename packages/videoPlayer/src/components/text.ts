import { Editor } from "../index"
import { ITextTrackItem } from "@clipwiz/shared"
import { TIME_CONFIG } from "@clipwiz/shared"

export const addTextNode = async (editor: Editor, trackId: string, item: ITextTrackItem) => {
  const canvas = document.createElement('canvas')

  const buffer = await fetch(item.url!).then((response) => response.arrayBuffer());
  const pagFile = await editor.pag.PAG.PAGFile.load(buffer);
  debugger;
  canvas.width = 1280;
  canvas.height = 720;
  canvas.style.width = 1280 + 'px';
  canvas.style.height = 720 + 'px';
  const pagView = await editor.pag.PAG.PAGView.init(pagFile, canvas);
  const textNode = editor.videoCtx.canvas(canvas);
  textNode.id = item.id
  textNode.trackId = trackId
  textNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  textNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  textNode.connect(editor.videoCtx.destination)
  textNode.registerCallback('play', () => {
    pagView.play();
  })
  textNode.registerCallback('ended', () => {
    pagView.stop();
    pagView.flush();
    // 销毁pagView
    pagView.destroy();
    // 销毁canvas
    canvas.remove();
    // 销毁textNode
    textNode.destroy();
  })
}
