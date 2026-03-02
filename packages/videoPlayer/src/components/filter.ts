import type { Editor } from '../index'
import { IFilterTrackItem, TIME_CONFIG } from '@clipwiz/shared'
import VideoContext from '../videocontext';

export const addFilter = (editor: Editor, trackId: string, item: IFilterTrackItem) => {
  const destination = editor.videoCtx.destination;
  const blur = editor.videoCtx.effect(VideoContext.DEFINITIONS.MONOCHROME);
  // // // 1. 找到当前所有连到 destination 的输入节点（整画面的“当前内容”）
  const inputs = (destination as any).inputs; // GraphNode 自带的 getter

  inputs.forEach((input: any) => {
    if(input._displayName === 'TransitionNode' && editor.videoCtx.currentTime < 3) {
      input.disconnect(); // 关键：先从 destination 上拆下来
      input.connect(blur);
    }
  });

  blur.connect(destination);
  editor.videoCtx.registerCallback("update", function() {
    const time =  editor.videoCtx.currentTime;
    // 更新滤镜管理器
    if(time >= (item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)) {
      inputs.forEach((input: any) => {
        if(input._displayName === 'TransitionNode') {
          input.disconnect(); // 关键：先从 destination 上拆下来
          input.connect(destination);
        }
      });
    }
    if(time < (item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)) {
      inputs.forEach((input: any) => {
        if(input._displayName === 'TransitionNode' && editor.videoCtx.currentTime < 3) {
          input.disconnect(); // 关键：先从 destination 上拆下来
          input.connect(blur);
        }
      });
    }
  });
}


