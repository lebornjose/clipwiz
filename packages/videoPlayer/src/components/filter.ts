import type { Editor } from '../index'
import { IFilterTrackItem, TIME_CONFIG } from '@clipwiz/shared'
import VideoContext from '../videocontext';

/**
 * 带时间控制的效果
 */
export const addFilter = (editor: Editor, trackId: string, item: IFilterTrackItem): void => {

  const destination = editor.videoCtx.destination;
  const blur = editor.videoCtx.effect(VideoContext.DEFINITIONS.MONOCHROME);
  // // 1. 找到当前所有连到 destination 的输入节点（整画面的"当前内容"）
  const inputs = (destination as any).inputs; // GraphNode 自带的 getter
  blur.connect(destination);
  editor.videoCtx.registerCallback("update", function() {
    const time =  editor.videoCtx.currentTime;

    const filterEndTime = item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION;
    const filterStartTime = item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION
    // 更新滤镜管理器
    if(time >= filterEndTime && time<= filterStartTime) {
      inputs.forEach((input: any) => {
        if(input._displayName === 'VideoNode' && (input.startTime < filterStartTime || input.endTime > filterEndTime) ) {
          input.disconnect(); // 关键：先从 destination 上拆下来
          input.connect(destination);
        }
      });
    }
    if(time < filterEndTime && time > filterStartTime) {
      const soundtrack = editor.videoCtx._sourceNodes.filter((item) => {
        return item.endTime > time && item.startTime < time && item._displayName === 'VideoNode'
      });
      soundtrack.forEach((input: any) => {
        // if(input._displayName === 'VideoNode') {
          input.disconnect(); // 关键：先从 destination 上拆下来
          input.connect(blur);
        // }
      });
    }
  });
};
