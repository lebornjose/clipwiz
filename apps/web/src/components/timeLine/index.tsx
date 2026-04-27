import { Timeline, TimelineState } from '@xzdarcy/react-timeline-editor';
import {
  VideoCameraOutlined,
  AudioOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  MATERIAL_TYPE,
  IVideoTrackItem,
  IAudioTrackItem,
  IPhotoTrackItem,
  ISubtitleTrackItem,
  ITextTrackItem,
  IFilterTrackItem,
} from '@clipwiz/shared';
import { convertTrackInfoToTimelineRow, convertTimelineRowsToTrackInfo } from './convert';
import './index.less';
import { CustomTimelineAction, CustomTimelineRow, mockEffect } from './mock';
import { useRef, useState, useEffect } from 'react';
import { VideoTrackImg } from './videoTrackImg';
import { eventBus } from '../../utils';
import { useEditorStore } from '../../store/editorStore';

const TRACK_TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  [MATERIAL_TYPE.VIDEO]: <VideoCameraOutlined />,
  [MATERIAL_TYPE.BGM_AUDIO]: <AudioOutlined />,
  [MATERIAL_TYPE.SOUND_AUDIO]: <AudioOutlined />,
  [MATERIAL_TYPE.PHOTO]: <FileImageOutlined />,
  [MATERIAL_TYPE.SUBTITLE]: <FileTextOutlined />,
  [MATERIAL_TYPE.TEXT]: <FontSizeOutlined />,
  [MATERIAL_TYPE.FILTER]: <FilterOutlined />,
};

const TRACK_TYPE_CLASS_MAP: Record<string, string> = {
  [MATERIAL_TYPE.VIDEO]: 'video-item',
  [MATERIAL_TYPE.BGM_AUDIO]: 'bgm-item',
  [MATERIAL_TYPE.SOUND_AUDIO]: 'bgm-item',
  [MATERIAL_TYPE.PHOTO]: 'photo-item',
  [MATERIAL_TYPE.SUBTITLE]: 'subtitle-item',
  [MATERIAL_TYPE.TEXT]: 'text-item',
  [MATERIAL_TYPE.FILTER]: 'filter-item',
};

const TimeLine = () => {
  const timelineState = useRef<TimelineState | null>(null);
  const domRef = useRef<HTMLDivElement | null>(null);

  const {
    trackInfo,
    trackInfoVersion,
    setTrackInfo,
    setSelectedActionId,
    setSelectedAction,
    selectedTransitionKey,
    setSelectedTransitionKey,
    setCurrentTime,
  } = useEditorStore();

  const [editorData, setEditorData] = useState<CustomTimelineRow[]>(() =>
    trackInfo ? convertTrackInfoToTimelineRow(trackInfo) : []
  );

  // Re-derive editorData whenever the committed protocol changes (load / delete / external update)
  useEffect(() => {
    if (!trackInfo) return;
    setEditorData(convertTrackInfoToTimelineRow(trackInfo));
  }, [trackInfoVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  // DOM event delegation: click on .timeline-editor-action -> add active class
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const actionEl = target.closest('.timeline-editor-action') as HTMLElement | null;

      // Remove old active
      container.querySelectorAll('.timeline-editor-action--active').forEach((el) => {
        el.classList.remove('timeline-editor-action--active');
      });

      if (actionEl) {
        actionEl.classList.add('timeline-editor-action--active');
        const actionContent = actionEl.querySelector('[data-action-id]') as HTMLElement | null;
        const actionId = actionContent?.dataset.actionId;
        const trackId = actionContent?.dataset.trackId;
        if (actionId && trackId) {
          setSelectedAction(trackId, actionId);
        } else if (actionId) {
          setSelectedActionId(actionId);
        }
      } else {
        setSelectedActionId(null);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Timeline engine event wiring
  useEffect(() => {
    const onPause = () => timelineState.current?.pause();
    const onPlay = () => {
      if (!trackInfo) return;
      timelineState.current?.play({ endTime: trackInfo.duration / 1000 } as any);
    };
    const onSeek = (time: number) => timelineState.current?.setTime(time);

    eventBus.on('video:pause', onPause);
    eventBus.on('video:play', onPlay);
    eventBus.on('video:seek', onSeek);

    if (timelineState.current) {
      timelineState.current.listener.on('afterSetTime', ({ time }: { time: number }) => {
        eventBus.emit('time:update', time);
        setCurrentTime(time);
      });
    }

    return () => {
      eventBus.off('video:pause', onPause);
      eventBus.off('video:play', onPlay);
      eventBus.off('video:seek', onSeek);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const commitToStore = (rows: CustomTimelineRow[], clearVideoTransitions = false) => {
    if (!trackInfo) return;
    const newInfo = convertTimelineRowsToTrackInfo(rows, trackInfo);
    if (!clearVideoTransitions) {
      setTrackInfo(newInfo);
      return;
    }
    setTrackInfo({
      ...newInfo,
      tracks: newInfo.tracks.map((track) => {
        if (track.trackType !== MATERIAL_TYPE.VIDEO) return track;
        return {
          ...track,
          children: (track.children as IVideoTrackItem[]).map((child) => ({
            ...child,
            transitionIn: undefined,
            transitionOut: undefined,
          })),
        };
      }) as typeof newInfo.tracks,
    });
  };

  /**
   * After a video clip is moved or resized, sort all clips by start time and
   * close every gap/overlap so that clip[i].end === clip[i+1].start for all i.
   * Each clip's duration is preserved; only its position shifts.
   * The first clip (leftmost) keeps its current start position as the anchor.
   */
  const normalizeVideoTrack = (
    rows: CustomTimelineRow[],
    changedRowId: string,
  ): CustomTimelineRow[] => {
    return rows.map((row) => {
      if (row.id !== changedRowId) return row;
      if (!row.actions.some((a) => a.effectId === MATERIAL_TYPE.VIDEO)) return row;

      const sorted = [...row.actions].sort((a, b) => a.start - b.start);

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const duration = curr.end - curr.start;
        sorted[i] = { ...curr, start: prev.end, end: prev.end + duration };
      }

      return { ...row, actions: sorted };
    });
  };

  if (!trackInfo) return null;

  return (
    <div
      ref={timelineContainerRef}
      className="time-line"
    >
      <div
        ref={domRef}
        style={{ overflow: 'overlay' as any }}
        onScroll={(e) => {
          timelineState.current?.setScrollTop((e.target as HTMLDivElement).scrollTop);
        }}
        className="timeline-list"
      >
        {trackInfo.tracks.map((item) => {
          const trackType = item.trackType as MATERIAL_TYPE;
          return (
            <div
              key={item.trackId}
              className={`timeline-list-item ${TRACK_TYPE_CLASS_MAP[trackType] || ''}`}
            >
              {TRACK_TYPE_ICON_MAP[trackType] || null}
            </div>
          );
        })}
      </div>

      <Timeline
        ref={timelineState}
        autoScroll={true}
        style={{ width: '100%', height: '400px' }}
        scale={1}
        scaleSplitCount={25}
        editorData={editorData}
        effects={mockEffect}
        onChange={(data) => {
          setEditorData(data as CustomTimelineRow[]);
        }}
        onActionMoveEnd={({ row, action, start, end }) => {
          const patched = editorData.map((r) =>
            r.id !== row.id
              ? r
              : {
                  ...r,
                  actions: r.actions.map((a) =>
                    a.id !== action.id ? a : { ...a, start, end }
                  ),
                }
          );
          const updated = normalizeVideoTrack(patched, row.id);
          setEditorData(updated);
          commitToStore(updated, true);
        }}
        onActionResizeEnd={({ row, action, start, end }) => {
          const patched = editorData.map((r) =>
            r.id !== row.id
              ? r
              : {
                  ...r,
                  actions: r.actions.map((a) =>
                    a.id !== action.id ? a : { ...a, start, end }
                  ),
                }
          );
          const updated = normalizeVideoTrack(patched, row.id);
          setEditorData(updated);
          commitToStore(updated, true);
        }}
        onClickAction={undefined}
        onClickRow={undefined}
        getActionRender={(action) => {
          const trackItem = (action as CustomTimelineAction).data as
            | IVideoTrackItem
            | IAudioTrackItem
            | IPhotoTrackItem
            | null;
          const effectId = action.effectId as string;

          const trackId = ((action as CustomTimelineAction).data as any)?._trackId as string | undefined;
          const actionAttrs = { 'data-action-id': action.id, 'data-track-id': trackId };

          const renderers: Record<string, () => React.ReactNode> = {
            [MATERIAL_TYPE.VIDEO]: () => (
              <div className="action-content" {...actionAttrs}>
                <VideoTrackImg
                  videoTrackItem={trackItem as IVideoTrackItem}
                  selectedTransitionKey={selectedTransitionKey}
                  onTransitionClick={(key) => setSelectedTransitionKey(key)}
                />
              </div>
            ),
            [MATERIAL_TYPE.BGM_AUDIO]: () => (
              <div className="effect-item-audio action-content" {...actionAttrs}>
                <AudioOutlined />
                {(trackItem as IAudioTrackItem)?.title}
              </div>
            ),
            [MATERIAL_TYPE.SOUND_AUDIO]: () => (
              <div className="effect-item-audio action-content" {...actionAttrs}>
                <AudioOutlined />
                {(trackItem as IAudioTrackItem)?.title}
              </div>
            ),
            [MATERIAL_TYPE.PHOTO]: () => (
              <div className="effect-item-photo action-content" {...actionAttrs}>
                <FileImageOutlined />
                {(trackItem as IPhotoTrackItem)?.desc || '图片'}
              </div>
            ),
            [MATERIAL_TYPE.SUBTITLE]: () => (
              <div className="effect-item-subtitle action-content" {...actionAttrs}>
                <FileTextOutlined />
                {(trackItem as unknown as ISubtitleTrackItem)?.text || '字幕'}
              </div>
            ),
            [MATERIAL_TYPE.TEXT]: () => (
              <div className="effect-item-text action-content" {...actionAttrs}>
                <FontSizeOutlined />
                {(trackItem as unknown as ITextTrackItem)?.text || '文本'}
              </div>
            ),
            [MATERIAL_TYPE.FILTER]: () => (
              <div className="effect-item-filter action-content" {...actionAttrs}>
                <FilterOutlined />
                {(trackItem as unknown as IFilterTrackItem)?.name || '滤镜'}
              </div>
            ),
          };

          return renderers[effectId]?.() || null;
        }}
      />
    </div>
  );
};

export default TimeLine;
