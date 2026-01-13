

export interface TrackItem {
  id: string // 唯一标识
  materialId?: string // 素材ID
  url: string // 素材地址
  startTime: number // 开始时间(相对于整个视频的时间)
  endTime: number // 结束时间(相对于整个视频的时间)
  hide: boolean // 是否隐藏
}


export interface Transform {
  translate: [number, number, number] // x, y ,z  例如：[0.5,0.5] 表示居中
  rotate: [number, number, number] // x, y, z
  scale: [number, number, number] // x,y,z
}


export interface IVideoTrackItem extends TrackItem {
  segmentId?: string // 片段ID
  format: 'video' | 'image'
  title?: string // 素材名称
  duration: number // 视频时长
  fromTime: number // 起始时间(相对于素材的时间)
  toTime: number // 结束时间(相对于素材的时间)
  width: number // 视频分辨率的宽度
  height: number // 视频分辨率的高度
  alpha?: number // 透明度 0 - 1
  muted?: boolean // 是否静音
  volume: number // 声音
  playRate: number // 是否变速
  transform?: Transform // 变换
  segmentStartTime?: number // 可以播放到的最小时间
  segmentEndTime?: number // 可以播放到的最大时间
  crop?: {
    // 裁剪
    x0: number
    x1: number
    y0: number
    y1: number
  }
  needCut: number
  soundtrack?: number // 是否保留原声音
  audioStartTime?: number
  audioEndTime?: number
  fadeIn?: number
  fadeOut?: number
  scaleMode?: number
}

export interface VideoTrack {
  trackType: string // 轨道类型
  children: IVideoTrackItem[] // 视频列表
  trackId: string
  hide: boolean
}

export interface IAudioTrackItem extends TrackItem {
  id: string
  duration: number // 音频时长
  fromTime: number // 起始时间(相对于素材的时间)
  toTime: number // 结束时间(相对于素材的时间)
  title: string // bgm 名称 | 口播文案
  playRate: number // 播放速率 0 - 1
  volume: number // 音量 0 - 1
  sound: number
  audioSpeaker?: string // 口播音色
  fadeIn: number | undefined// 音频淡入时间
  fadeOut: number | undefined // 音频淡出时间
  muted: boolean // 是否静音
  format?: string
}

export interface BgmAudioTrack {
  trackType: 'bgmAudio' // 轨道类型
  children: IAudioTrackItem[] // 音频列表
  trackId: string
  hide: boolean
}


export type ITrack = (VideoTrack | BgmAudioTrack) // 轨道列表

export interface ITrackInfo {
  width: number // 导出视频的宽度
  height: number // 导出视频的高度， // 切换画笔比例，只修改width值，height保持不变
  duration: number // 总时长
  fps?: number // 帧率
  tracks: ITrack[] // 轨道列表
}
