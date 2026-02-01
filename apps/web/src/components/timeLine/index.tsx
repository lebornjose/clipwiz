
import { Timeline, TimelineState } from '@xzdarcy/react-timeline-editor';
import { VideoCameraOutlined, AudioOutlined, FileImageOutlined, FileTextOutlined, FontSizeOutlined } from '@ant-design/icons';
import { MATERIAL_TYPE, IVideoTrackItem, IAudioTrackItem, IPhotoTrackItem, ISubtitleTrackItem, ITextTrackItem } from '@clipwiz/shared';
import { convertTrackInfoToTimelineRow } from './convert';
import './index.less';
import { CustomTimelineAction, CustomTimelineRow } from './mock';
import { mockEffect } from './mock';
import { useRef, useState, useEffect } from 'react';
import trackInfo from '../../mock'
import { VideoTrackImg } from './videoTrackImg';
import { eventBus } from '../../utils';

// 轨道类型到图标的映射
const TRACK_TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  [MATERIAL_TYPE.VIDEO]: <VideoCameraOutlined />,
  [MATERIAL_TYPE.BGM_AUDIO]: <AudioOutlined />,
  [MATERIAL_TYPE.PHOTO]: <FileImageOutlined />,
  [MATERIAL_TYPE.SUBTITLE]: <FileTextOutlined />,
  [MATERIAL_TYPE.TEXT]: <FontSizeOutlined />,
};

// 轨道类型到样式类名的映射
const TRACK_TYPE_CLASS_MAP: Record<string, string> = {
  [MATERIAL_TYPE.VIDEO]: 'video-item',
  [MATERIAL_TYPE.BGM_AUDIO]: 'bgm-item',
  [MATERIAL_TYPE.PHOTO]: 'photo-item',
  [MATERIAL_TYPE.SUBTITLE]: 'subtitle-item',
  [MATERIAL_TYPE.TEXT]: 'text-item',
} as const;

const TimeLine = () => {
  const timelineState = useRef<TimelineState | null>(null);
  const domRef = useRef<HTMLDivElement | null>(null);
  const listData = convertTrackInfoToTimelineRow(trackInfo);
  const [editorData, setEditorData] = useState<CustomTimelineRow[]>(listData);

  useEffect(() => {
    eventBus.on('video:pause', (time: number) => {
      timelineState.current?.pause();
    });
    eventBus.on('video:play', (time: number) => {
      timelineState.current?.setScrollTop(time);
      timelineState.current?.play({ });
    });
  }, []);
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
            const trackType = item.trackType as MATERIAL_TYPE;
            return (
              <div
                key={item.trackId}
                className={`timeline-list-item ${TRACK_TYPE_CLASS_MAP[trackType as keyof typeof TRACK_TYPE_CLASS_MAP] || ''}`}
              >
                {TRACK_TYPE_ICON_MAP[trackType as keyof typeof TRACK_TYPE_ICON_MAP] || null}
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
          setEditorData(data as CustomTimelineRow[]);
        }}
        getActionRender={(action) => {
          const trackItem = (action as CustomTimelineAction).data as IVideoTrackItem | IAudioTrackItem | IPhotoTrackItem | null;
          const effectId = action.effectId as string;

          // 使用对象映射来渲染不同类型的轨道
          const actionRenderers: Record<string, () => React.ReactNode> = {
            [MATERIAL_TYPE.VIDEO]: () => (
              <VideoTrackImg key={action.id} videoTrackItem={trackItem as IVideoTrackItem} />
            ),
            [MATERIAL_TYPE.BGM_AUDIO]: () => (
              <div key={action.id} className='effect-item-audio'>
                <AudioOutlined />
                {(trackItem as IAudioTrackItem)?.title}
              </div>
            ),
            [MATERIAL_TYPE.PHOTO]: () => (
              <div key={action.id} className='effect-item-photo'>
                <FileImageOutlined />
                {(trackItem as IPhotoTrackItem)?.desc || '图片'}
              </div>
            ),
            [MATERIAL_TYPE.SUBTITLE]: () => (
              <div key={action.id} className='effect-item-subtitle'>
                <FileTextOutlined />
                {(trackItem as unknown as ISubtitleTrackItem)?.text || '字幕'}
              </div>
            ),
            [MATERIAL_TYPE.TEXT]: () => (
              <div key={action.id} className='effect-item-text'>
                <FontSizeOutlined />
                {(trackItem as unknown as ITextTrackItem)?.text || '文本'}
              </div>
            ),
          };

          return actionRenderers[effectId]?.() || null;
        }}
      />
    </div>
  )
}


export default TimeLine
