import { ITrack, ITrackInfo, MATERIAL_TYPE, TrackItem, IVideoTrackItem } from '@clipwiz/shared'
import { TIME_CONFIG } from '@clipwiz/shared';
import { CustomTimelineRow } from './mock';

// 把 trackInfo 转换为 TimelineRow
export const convertTrackInfoToTimelineRow = (trackInfo: ITrackInfo): CustomTimelineRow[] => {
  return trackInfo.tracks.map((item: ITrack) => ({
    id: item.trackId,
    actions: item.children.map((child: TrackItem) => ({
      id: child.id,
      effectId: item.trackType,
      start: child.startTime / TIME_CONFIG.MILL_TIME_CONVERSION,
      end: child.endTime / TIME_CONFIG.MILL_TIME_CONVERSION,
      selected: true,
      movable: true,
      data: child as any, // 先强制 any，避免类型不匹配
    })),
    rowHeight: item.trackType === MATERIAL_TYPE.VIDEO ? 100 : 32, // 自定义行高
  }));
};
