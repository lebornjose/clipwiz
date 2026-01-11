
import { Timeline, TimelineRow } from '@xzdarcy/react-timeline-editor';
import './index.less';
import { CustomTimelineAction } from './mock';
import { mockData, mockEffect } from './mock';
import { useState } from 'react';
const TimeLine = () => {
  const [editorData, setEditorData] = useState<TimelineRow[]>(mockData);

  return (
    <div className="time-line">
      <Timeline
        autoScroll={true}
        style={{
          width: '100%',
          height: '600px',
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
