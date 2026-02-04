export enum MATERIAL_TYPE {
  VIDEO = 'video',
  AUDIO = 'audio', // 音频
  IMAGE = 'image',
  TEXT = 'text',
  SUBTITLE = 'subtitle',
  PHOTO = 'photo', // 贴图
  BGM = 'bgm', // 音频 的bgm 类型
  ORAL = 'oral', // 音频 的 口播类型
  ORAL_AUDIO = 'oralAudio',
  BGM_AUDIO = 'bgmAudio',
  SOUND_AUDIO = 'soundAudio', // 音效
  GIF = 'gif', // 贴图类型，gif
  BACKGROUND = 'background', // 背景
  FILTER = 'filter', // 滤镜轨道
}


export enum TIME_CONFIG {
  SUBTITLE_TRANSITION = 1, // 字幕动画时间
  FRAME_TIME = 0.04, // 帧时唱
  FRAME_TIME_MILL = 40, // 帧时长毫秒
  MILL_TIME_CONVERSION = 1000, // 毫秒换算成秒 除 1000
}
