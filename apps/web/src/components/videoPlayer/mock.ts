
import { ITrackInfo, MATERIAL_TYPE } from '@clipwiz/shared'

const trackInfo: ITrackInfo = {
  width: 1280,
  height: 720,
  duration: 10000,
  tracks: [
    {
      hide: false,
      trackId: "40369",
      trackType: MATERIAL_TYPE.VIDEO,
      children: [
        {
          // TrackItem 必需属性
          id: "4",
          url: "https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231020/vc-upload-1697713775615-75_mute.mp4", //"https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/algorithm_qn/process/20240722/1721649059534_mute.mp4",
          startTime: 0,
          endTime: 5000,
          hide: false,
          // IVideoTrackItem 特有属性
          format: MATERIAL_TYPE.VIDEO,
          duration: 5000,
          fromTime: 0,
          toTime: 5000, // fromTime + duration
          width: 1280,
          height: 720,
          volume: 1,
          playRate: 1,
          needCut: 0,
        }
      ],
    },
  ],
}

export default trackInfo
