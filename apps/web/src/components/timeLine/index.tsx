
import { Timeline, TimelineRow, TimelineState } from '@xzdarcy/react-timeline-editor';
import { VideoCameraOutlined, AudioOutlined, FileImageOutlined } from '@ant-design/icons';
import { MATERIAL_TYPE, IVideoTrackItem, IAudioTrackItem } from '@clipwiz/shared';
import { convertTrackInfoToTimelineRow } from './convert';
import './index.less';
import { CustomTimelineAction } from './mock';
import { mockData, mockEffect } from './mock';
import { useRef, useState } from 'react';
import trackInfo from '../../mock'
import { VideoTrackImg } from './videoTrackImg';
const TimeLine = () => {
  const timelineState = useRef<TimelineState | null>(null);
  const domRef = useRef<HTMLDivElement | null>(null);
  const listData = convertTrackInfoToTimelineRow(trackInfo);
  const [editorData, setEditorData] = useState<CustomTimelineRow[]>(listData);


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
              <div key={item.trackId} className={`timeline-list-item ${item.trackType === MATERIAL_TYPE.VIDEO ? 'video-item' : 'bgm-item'}`}>
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
          setEditorData(data as TimelineRow[]);
        }}
        getActionRender={(action, row) => {
          const videoTrackItem = (action as CustomTimelineAction).data as IVideoTrackItem | IAudioTrackItem | null;
          if(action.effectId === MATERIAL_TYPE.VIDEO) {
            return (
              <VideoTrackImg key={action.id} videoTrackItem={ videoTrackItem as unknown as IVideoTrackItem} />
            )
          } else if(action.effectId === MATERIAL_TYPE.BGM_AUDIO) {
            return (
              <div key={action.id} className='effect-item-audio'>
                <AudioOutlined />
                {
                videoTrackItem?.title
              }</div>
            )
          } else if(action.effectId === MATERIAL_TYPE.PHOTO) {
            return (
              <div key={action.id} className='effect-item-photo'>
                <FileImageOutlined />
              </div>
            )
          }
        }}
      />
    </div>
  )
}


export default TimeLine
