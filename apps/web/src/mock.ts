import { ITrackInfo, MATERIAL_TYPE } from '@clipwiz/shared'

const trackInfo: ITrackInfo = {
  width: 1280,
  height: 720,
  duration: 10000,
  tracks: [
    {
      hide: false,
      trackId: "40128",
      trackType: MATERIAL_TYPE.PHOTO,
      children: [
        {
          id: "38",
          url: "https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/yuxiaopu/Dependencies/%E5%B0%8F%E7%B1%B3%E6%96%B0%E7%89%88%E7%AE%AD%E5%A4%B4.gif",
          startTime: 0,
          endTime: 10000,
          hide: false,
          format: "gif",
          desc: "箭头",
          width: 720, // ✅ 必需：贴图宽度
          height: 1280, // ✅ 必需：贴图高度
          duration: 10000,
          crop: { // ✅ 必需：裁剪信息
            x0: 0,
            x1: 1,
            y0: 0,
            y1: 1,
          },
          transform: {
            scale: [1, 1, 1],
            rotate: [0, 0, 0],
            translate: [0, 0, 0],
          },
        }
      ]
    },
    {
      hide: false,
      trackId: "40369",
      trackType: MATERIAL_TYPE.VIDEO,
      children: [
        {
          // TrackItem 必需属性
          id: "4",
          url: "https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/algorithm_qn/process/20240722/1721649059534_mute.mp4",
          startTime: 0,
          endTime: 10000,
          hide: false,
          // IVideoTrackItem 特有属性
          format: MATERIAL_TYPE.VIDEO,
          duration: 10000,
          fromTime: 0,
          toTime: 10000, // fromTime + duration
          width: 1280,
          height: 720,
          volume: 1,
          playRate: 1,
          needCut: 0,
        }
      ],
    },
    {
      hide: false,
      trackId: "40379",
      trackType: MATERIAL_TYPE.BGM_AUDIO,  // ✅ 修改为 BGM_AUDIO（对应 'bgmAudio'）
      children: [
        {
          id: "4",
          startTime: 0,
          endTime: 10000,
          hide: false,
          volume: 1,
          sound: 1,
          playRate: 1,
          muted: false,
          format: MATERIAL_TYPE.BGM,  // ✅ format 用 BGM（对应 'bgm'）
          title: "bgm",
          duration: 10000,
          fromTime: 0,
          toTime: 10000,
          url: "https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/shetu_music_mp3/samedB/01aea59f597c39b8e0143308027c950c.wav",
          fadeIn: undefined,  // ✅ 添加淡入时间（可选）
          fadeOut: undefined, // ✅ 添加淡出时间（可选）
        }
      ]
    }
  ],
}

export default trackInfo
