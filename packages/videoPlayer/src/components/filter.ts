import type { Editor } from '../index'
import type { IFilterTrackItem } from '@clipwiz/shared'
import VideoContext from '../videocontext';

export const addFilter = (editor: Editor, trackId: string, item: IFilterTrackItem) => {
  const destination = editor.videoCtx.destination;

  const blur = editor.videoCtx.effect(VideoContext.DEFINITIONS.MONOCHROME);
  // // 1. 找到当前所有连到 destination 的输入节点（整画面的“当前内容”）
  const inputs = destination.inputs; // GraphNode 自带的 getter

  // // 2. 创建一个合成节点，把所有输入先合成成一条
  // const combine = editor.videoCtx.compositor(VideoContext.DEFINITIONS.COMBINE);
  // debugger
  inputs.forEach(input => {
    if(input.format === 'video') {
      input.disconnect(); // 关键：先从 destination 上拆下来
      input.connect(blur);
    }

  });

  blur.connect(destination);

  editor.videoCtx.registerCallback("update", function() {
    const time =  editor.videoCtx.currentTime;

    // 更新滤镜管理器
    if(time >=3) {
      inputs.forEach(input => {
        if(input.format === 'video') {
          input.disconnect(); // 关键：先从 destination 上拆下来
          input.connect(destination);
        }
      });
    }

  });
  // combine.connect(blur);
  // combine.connect(destination);

  // blur.start(0);
  // blur.stop(3);
}


