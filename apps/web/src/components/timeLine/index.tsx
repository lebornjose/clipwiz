
import { Timeline, TimelineRow, TimelineState } from '@xzdarcy/react-timeline-editor';
import { VideoCameraOutlined, AudioOutlined } from '@ant-design/icons';
import { MATERIAL_TYPE } from '@clipwiz/shared';
import { convertTrackInfoToTimelineRow } from './convert';
import './index.less';
import { CustomTimelineAction } from './mock';
import { mockData, mockEffect } from './mock';
import { useRef, useState } from 'react';
import trackInfo from '../../mock'
const TimeLine = () => {
  const timelineState = useRef<TimelineState | null>(null);
  const domRef = useRef<HTMLDivElement | null>(null);
  const listData = convertTrackInfoToTimelineRow(trackInfo);
  const [editorData, setEditorData] = useState<TimelineRow[]>(listData);


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
        {
          trackInfo.tracks.map((item) => {
            return (
              <div className={`timeline-list-item ${item.trackType === MATERIAL_TYPE.VIDEO ? 'video-item' : 'bgm-item'}`}>
                {item.trackType === MATERIAL_TYPE.VIDEO ? <VideoCameraOutlined /> : <AudioOutlined />}
              </div>
            )
          })
        }
      </div>
      <Timeline
        ref={timelineState}
        autoScroll={true}
        style={{
          width: '100%',
          height: '400px',
        }}
        scale={1}
        scaleSplitCount={25} // 25 帧视频
        editorData={editorData}
        effects={mockEffect}
        onChange={(data) => {
          setEditorData(data as CustomTimelineAction[]);
        }}
        getActionRender={(action, row) => {
          if(action.effectId === MATERIAL_TYPE.VIDEO) {
            return (
              <div className='effect-item-video'>播放视频</div>
            )
          } else if(action.effectId === MATERIAL_TYPE.BGM_AUDIO) {
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
