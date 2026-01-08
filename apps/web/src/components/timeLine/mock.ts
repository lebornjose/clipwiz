import { TimelineRow, TimelineEffect } from '@xzdarcy/react-timeline-editor';

interface CustomTimelineAction extends TimelineRow {
  data: {
    src: string;
  };
}
const mockData: CustomTimelineAction[] = [
  {
    id: '1',
    actions: [
       {
          id: '1-1',
          effectId: 'effect0',
          start: 0,
          end: 10,
          selected: true,
          movable: true
       }
    ],
    rowHeight: 100, // 自定义行高
    data: {
      src: 'xxxx',
    }
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
          movable: true
      }
    ],
    data: {
      src: 'xxxx',
    }
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

