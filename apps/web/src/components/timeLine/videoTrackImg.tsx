import { ColumnWidthOutlined } from '@ant-design/icons';
import { MATERIAL_TYPE } from '@clipwiz/shared';
import { TimelineVideoActionData } from './convert';
import { CSSProperties, useMemo } from 'react';

interface VideoTrackImgProps {
  videoTrackItem: TimelineVideoActionData | null;
  selectedTransitionKey?: string | null;
  onTransitionClick?: (key: string, e: React.MouseEvent) => void;
  thumbnailsPerSecond?: number;
}

const getTransitionBadge = (videoTrackItem: TimelineVideoActionData | null) => {
  const transitionMeta = videoTrackItem?._transitionMeta
  const transitionSide = videoTrackItem?._transitionSide

  if (!transitionMeta || !transitionSide) return null

  return {
    key: transitionMeta.key,
    label: transitionMeta.transition.alias || transitionMeta.transition.name || '转场',
    duration: `${(transitionMeta.duration / 1000).toFixed(2)}s`,
    placement: transitionSide,
  }
}

const MIN_THUMBNAILS = 2
const MAX_THUMBNAILS = 120
const DEFAULT_THUMBNAILS_PER_SECOND = 2

const appendOssSnapshotProcess = (url: string, tMs: number, width: number, height: number): string => {
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}x-oss-process=video/snapshot,t_${Math.max(0, Math.round(tMs))},w_${width},h_${height}`
}

export const VideoTrackImg = ({
  videoTrackItem,
  selectedTransitionKey,
  onTransitionClick,
  thumbnailsPerSecond = DEFAULT_THUMBNAILS_PER_SECOND,
}: VideoTrackImgProps) => {
  const url = videoTrackItem?.url || '';
  const isImage = videoTrackItem?.format === MATERIAL_TYPE.IMAGE;
  const timelineDurationMs = Math.max(0, (videoTrackItem?.endTime ?? 0) - (videoTrackItem?.startTime ?? 0))
  const sourceFromMs = Math.max(0, videoTrackItem?.fromTime ?? 0)
  const sourceToMs = Math.max(sourceFromMs, videoTrackItem?.toTime ?? sourceFromMs + timelineDurationMs)
  const playRate = Math.max(0.01, videoTrackItem?.playRate ?? 1)
  // 轨道上可见时长会消耗 sourceRange 的一部分（受 playRate 影响）
  // consumedSourceMs = timelineDurationMs * playRate，并且不能超过 toTime
  const sourceRangeMs = Math.max(0, sourceToMs - sourceFromMs)
  const consumedSourceMs = Math.min(sourceRangeMs, timelineDurationMs * playRate)
  const density = Math.max(0.1, thumbnailsPerSecond)

  const thumbnailCount = useMemo(() => {
    if (!videoTrackItem) return 0
    const byDuration = Math.ceil((timelineDurationMs / 1000) * density)
    return Math.min(MAX_THUMBNAILS, Math.max(MIN_THUMBNAILS, byDuration))
  }, [videoTrackItem, timelineDurationMs, density])

  const thumbnails = useMemo(() => {
    if (!url || !thumbnailCount) return []

    return Array.from({ length: thumbnailCount }).map((_, index) => {
      if (isImage) return url

      // 轨道时间 -> 素材时间映射：
      // 使用每个平铺格子的“中心时刻”取帧，避免端点采样导致最后一格跳到区间边界。
      const bucketStartMs = (index / thumbnailCount) * timelineDurationMs
      const bucketEndMs = ((index + 1) / thumbnailCount) * timelineDurationMs
      const timelineSampleMs = (bucketStartMs + bucketEndMs) / 2
      const consumedSampleMs = Math.min(consumedSourceMs, timelineSampleMs * playRate)
      const snapshotTimeMs = sourceFromMs + consumedSampleMs
      return appendOssSnapshotProcess(url, snapshotTimeMs, 160, 100)
    })
  }, [consumedSourceMs, isImage, playRate, sourceFromMs, thumbnailCount, timelineDurationMs, url])

  const transitionBadge = getTransitionBadge(videoTrackItem)
  const isTransitionSelected = transitionBadge ? transitionBadge.key === selectedTransitionKey : false
  const stripStyle = { '--thumb-count': thumbnailCount } as CSSProperties

  return (
    <div className='effect-item-video'>
      <div className='effect-item-video-strip' style={stripStyle}>
        {thumbnails.map((thumbnailUrl, index) => (
          <img
            src={thumbnailUrl}
            key={index}
            alt={`frame-${index}`}
          />
        ))}
      </div>

      <div className='effect-item-video-overlay'>
        <span className='effect-item-video-title'>
          {videoTrackItem?.title || videoTrackItem?.id || '视频片段'}
        </span>
      </div>

      {transitionBadge && (
        <div
          className={`effect-item-transition-chip effect-item-transition-chip--${transitionBadge.placement}${isTransitionSelected ? ' effect-item-transition-chip--selected' : ''}`}
          title={`${transitionBadge.label} · ${transitionBadge.duration}`}
          onClick={(e) => {
            e.stopPropagation()
            onTransitionClick?.(transitionBadge.key, e)
          }}
        >
          <ColumnWidthOutlined />
          <span>{transitionBadge.label}</span>
          <em>{transitionBadge.duration}</em>
        </div>
      )}
    </div>
  )
}
