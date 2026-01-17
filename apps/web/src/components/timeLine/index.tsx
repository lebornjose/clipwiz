
import { Timeline, TimelineRow, TimelineState } from '@xzdarcy/react-timeline-editor';
import { VideoCameraOutlined, AudioOutlined } from '@ant-design/icons';
import './index.less';
import { CustomTimelineAction } from './mock';
import { mockData, mockEffect } from './mock';
import { useRef, useState } from 'react';
const TimeLine = () => {
  const timelineState = useRef<TimelineState | null>(null);
  const domRef = useRef<HTMLDivElement | null>(null);
  const [editorData, setEditorData] = useState<TimelineRow[]>(mockData);

  return (
    <div className="time-line">
      <div ref={domRef}
        style={{ overflow: 'overlay' }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          timelineState.current?.setScrollTop(target.scrollTop);
        }}
        className={'timeline-list'}
      >
          <div className="timeline-list-item video-item">
            <VideoCameraOutlined />
          </div>
          <div className="timeline-list-item bgm-item">
            <AudioOutlined />
          </div>
      </div>
      <Timeline
        ref={timelineState}
        autoScroll={true}
        style={{
          width: '100%',
          height: '500px',
        }}
        scale={1}
        scaleSplitCount={25} // 25 帧视频
        editorData={editorData}
        effects={mockEffect}
        onChange={(data) => {
          setEditorData(data as CustomTimelineAction[]);
        }}
        getActionRender={(action, row) => {
          if(action.effectId === 'effect0') {
            return (
              <div className='effect-item-video'>播放视频</div>
            )
          } else if(action.effectId === 'effect1') {
            return (
              <div className='effect-item-audio'>播放音效</div>
            )
          }
        }}
      />
    </div>
  )
}


export default TimeLine
