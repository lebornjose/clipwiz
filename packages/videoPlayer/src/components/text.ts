import { Editor } from "../index"
import { ITextTrackItem } from "@clipwiz/shared"
import { TIME_CONFIG } from "@clipwiz/shared"

export const addTextNode = async (editor: Editor, trackId: string, item: ITextTrackItem) => {
  const canvas = document.createElement('canvas')

  const buffer = await fetch(item.url!).then((response) => response.arrayBuffer());
  const pagFile = await editor.pag.PAG.PAGFile.load(buffer);

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

  // 设置 PAG 循环次数为 1（只播放一次）
  pagView.setRepeatCount(1);

  // 监听 PAG 动画更新事件 - 用于检测是否快结束了
  let hasCleared = false;
  pagView.addListener('onAnimationUpdate', (progress: number) => {
    // 当进度接近 100% 时（比如 95%），清空 canvas
    if (progress >= 0.95 && !hasCleared) {
      console.log('PAG animation near end (progress:', progress, '), clearing canvas');
      hasCleared = true;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  })

  textNode.registerCallback('play', () => {
    console.log('textNode play, isFirstPlay:', textNode._isFirstPlay);

    // 重置清空标志
    hasCleared = false;

    // 清空 canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (textNode._isFirstPlay) {
      // 首次播放，直接开始
      textNode._isFirstPlay = false;
      pagView.play();
    } else {
      // 非首次播放，重新设置 PAGFile 来强制重置
      pagView.setComposition(pagFile);
      // 设置循环次数
      pagView.setRepeatCount(1);
      // 开始播放
      pagView.play();
    }
  })




  textNode.registerCallback('seek', () => {
    console.log('textNode seek');
    // 暂停 PAG 动画
    pagView.pause();
  })

  textNode.registerCallback('ended', async () => {
    // debugger
    // console.log('textNode ended');

    // // 停止 PAG 播放
    // await pagView.stop(false);

    // // 清空 canvas（虽然 VideoContext 已经不再读取，但保持干净）
    // const ctx = canvas.getContext('2d');
    // if (ctx) {
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }
  })

  return textNode;
}
