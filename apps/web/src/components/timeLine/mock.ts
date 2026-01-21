import { TimelineRow, TimelineEffect, TimelineAction } from '@xzdarcy/react-timeline-editor';
import { ITrack } from '@clipwiz/shared';

// 扩展 TimelineAction，在每个 action 中添加 data（可以是 null 或 IVideoTrackItem）
export interface CustomTimelineAction extends TimelineAction {
  data: ITrack | null;
}

// 扩展 TimelineRow，使其 actions 使用自定义的 CustomTimelineAction
export interface CustomTimelineRow extends Omit<TimelineRow, 'actions'> {
  actions: CustomTimelineAction[];
}
const mockData: CustomTimelineRow[] = [
  {
    id: '1',
    actions: [
       {
          id: '1-1',
          effectId: 'effect0',
          start: 0,
          end: 10,
          selected: true,
          movable: true,
          data: null  // ✅ 可以是 null
       }
    ],
    rowHeight: 100, // 自定义行高
  },
  {
    id: '2',
    actions: [
      {
          id: '2-1',
          effectId: 'effect1',
          start: 3,
          end: 8,
          selected: true,
          movable: true,
          data: null  // ✅ 也可以是具体的 IVideoTrackItem 对象
      }
    ],
  }
]

const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: 'effect0',
    name: '播放音效',
  },
  effect1: {
    id: 'effect1',
    name: '播放视频',
  },
}

export { mockData, mockEffect };  export type { CustomTimelineAction };

