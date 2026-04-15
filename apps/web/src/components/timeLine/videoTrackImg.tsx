import { ColumnWidthOutlined } from '@ant-design/icons';
import { TimelineVideoActionData } from './convert';

interface VideoTrackImgProps {
  videoTrackItem: TimelineVideoActionData | null;
  selectedTransitionKey?: string | null;
  onTransitionClick?: (key: string, e: React.MouseEvent) => void;
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

export const VideoTrackImg = ({ videoTrackItem, selectedTransitionKey, onTransitionClick }: VideoTrackImgProps) => {
  const videoUrl = videoTrackItem?.url || '';
  const count = 5;
  const transitionBadge = getTransitionBadge(videoTrackItem)
  const isTransitionSelected = transitionBadge ? transitionBadge.key === selectedTransitionKey : false

  return (
    <div className='effect-item-video'>
      <div className='effect-item-video-strip'>
        {Array.from({ length: count }).map((_, index) => {
          return (
            <img
              src={`${videoUrl}?x-oss-process=video/snapshot,t_${index * 100},w_160,h_100`}
              key={index}
              alt={`video-frame-${index}`}
            />
          )
        })}
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
