import { ITrack, ITrackInfo, MATERIAL_TYPE } from '@clipwiz/shared'

// 把 trackInfo 转换为 TimelineRow
export const convertTrackInfoToTimelineRow = (trackInfo: ITrackInfo) => {
  return trackInfo.tracks.map((item: ITrack) => {
    return {
      id: item.trackId,
      action: [],
      rowHeight:  item.trackType === MATERIAL_TYPE.VIDEO ? 100 : 50, // 自定义行高
    }
  })
}
