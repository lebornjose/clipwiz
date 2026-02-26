import { ITrackInfo, MATERIAL_TYPE, IFilterTrackItem } from '@clipwiz/shared'

const trackInfo: ITrackInfo = {
  width: 1280,
  height: 720,
  duration: 10000,
  tracks: [
    {
      hide: false,
      trackId: "3984398",
      trackType: MATERIAL_TYPE.FILTER,
      children: [
        {
          id: "1769928697263",
          duration: 1000,
          startTime: 0,
          endTime: 3000,
          name: "滤镜1",
          code: "filter",
          hide: false,
          format: MATERIAL_TYPE.FILTER,
        } as IFilterTrackItem
      ]
    },
    {
      hide: false,
      trackId: "398434",
      trackType: MATERIAL_TYPE.TEXT,
      children: [
        {
          id: "1769928697263",
          duration: 1000,
          startTime: 0,
          endTime: 3000,
          text: "爱的唯物主义",
          format: MATERIAL_TYPE.TEXT,
          hide: false,
          url: "https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_355f85214d4976c3da7d96a8536f31a5/%E8%8A%B1%E5%AD%97pag/%E7%88%B1%E7%9A%84%E5%94%AF%E7%89%A9%E4%B8%BB%E4%B9%89pag.pag",
        }
      ]
    },
    {
      hide: false,
      trackId: "393234",
      trackType: MATERIAL_TYPE.SUBTITLE,
      children: [
        {
          id: "33434",
          duration: 10000,
          startTime: 0,
          endTime: 10000,
          text: "测试字幕",
          format: MATERIAL_TYPE.SUBTITLE,
          url: "https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/yuxiaopu/Dependencies/%E5%B0%8F%E7%B1%B3%E7%99%BD%E5%AD%97%E9%BB%91%E6%8F%8F%E8%BE%B9.pag",
          position: [360, 640 ],
          fontFamily: "ZiZhiQuXiMaiTi",
          strokeWidth: 6,
          fontSize: 50,
          strokeColor: [0,0,0],
          color: [255, 255, 255],
          hide: false,
        }
      ]
    },
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
          materialId: "38",
          hide: false,
          format: MATERIAL_TYPE.GIF,
          desc: "箭头",
          width: 1280, // ✅ 必需：贴图宽度
          height: 720, // ✅ 必需：贴图高度
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
          transitionIn: {
            alias: "圆形遮罩1",
            desc: "叠加",
            duration: 500,
            effectId: "0",
            format: 1,
            layerList: ["4", "5"],
            name: "xxx",
          }
        },
        {
          id: "5",
          startTime: 5000,
          endTime: 10000,
          hide: false,
          url: "https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/algorithm_qn/process/20250306/1741259970364.mp4",
          format: MATERIAL_TYPE.VIDEO,
          duration: 5000,
          fromTime: 0,
          toTime: 5000, // fromTime + duration
          width: 1280,
          height: 720,
          volume: 1,
          playRate: 1,
          needCut: 0,
          transitionOut: {
            alias: "圆形遮罩1",
            desc: "叠加",
            duration: 500,
            effectId: "0",
            format: 1,
            layerList: ["4", "5"],
            name: "xxx",
          }
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
