import { ITrack, ITrackInfo, MATERIAL_TYPE, TrackItem } from '@clipwiz/shared'
import { TimelineRow } from '@xzdarcy/react-timeline-editor';
import { TIME_CONFIG } from '@clipwiz/shared';

// 把 trackInfo 转换为 TimelineRow
export const convertTrackInfoToTimelineRow = (trackInfo: ITrackInfo): TimelineRow[] => {
  return trackInfo.tracks.map((item: ITrack) => {
    return {
      id: item.trackId,
      actions: item.children.map((child: TrackItem) => {
        return {
          id: child.id,
          effectId: item.trackType,
          start: child.startTime / TIME_CONFIG.MILL_TIME_CONVERSION,
          end: child.endTime / TIME_CONFIG.MILL_TIME_CONVERSION,
          selected: true,
          movable: true
        }
      }),
      rowHeight:  item.trackType === MATERIAL_TYPE.VIDEO ? 100 : 32, // 自定义行高
    }
  })
}
