
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
        editorData={editorData}
        effects={mockEffect}
        onChange={(data) => {
          setEditorData(data as CustomTimelineAction[]);
        }}
      />
    </div>
  )
}


export default TimeLine
