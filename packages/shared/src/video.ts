import { MATERIAL_TYPE } from "./enum"


export interface TrackItem {
  id: string // 唯一标识
  materialId?: string // 素材ID
  url: string // 素材地址
  startTime: number // 开始时间(相对于整个视频的时间)
  endTime: number // 结束时间(相对于整个视频的时间)
  hide: boolean // 是否隐藏
}

export const STATE = Object.freeze({
  PLAYING: 0,
  PAUSED: 1,
  STALLED: 2,
  ENDED: 3,
  BROKEN: 4,
})

export class DestinationNode {
  // todo
}
export interface INode {
  element: HTMLImageElement
  id: string
  trackId: string
  title?: string
  hide: boolean
  fromTime: number
  toTime?: number
  startTime: number
  stopTime: number
  _currentTime: number
  _elementType: string
  _startTime: number
  _stopTime: number
  materialId: string
  type: string
  url?: string
  useType?: string
  format: string
  duration: number
  start: (startTime: number) => void
  stop: (endTime: number) => void
  // pipParams: IPipParams
  // destination(): DestinationNode
  registerCallback(type: string, func: Function): void
  unregisterCallback(func: Function): void
  connect(targetNode: DestinationNode): boolean
  volume: number
  playbackRate: number // 倍速
  elementURL: string
  total?: number
  offset?: number
  sourceOffset?: number
  sound?: number
  destroy: Function
  imageData?: ImageData
  transitionData: {
    in: ImageData
    out: ImageData
  }
}


export interface IVideoNode extends INode {
  playbackRate: number
  sound: number
  soundtrack: number
  total: number
  muted: boolean
  metaData: IVideoTrackItem
  addTransition: Function
  removeTransition: Function
  // commonEffects?: CommonEffects[]
  _elementURL: string
}

export interface IPhotoNode extends INode {
  url: string
  format: MATERIAL_TYPE.GIF | MATERIAL_TYPE.IMAGE
  duration: number
  width: number
  height: number
  transform?: Transform
  crop?: {
    x0: number
    x1: number
    y0: number
    y1: number
  }
  ctx?: CanvasRenderingContext2D | null
}

export interface IAudioNode extends INode {
  fadeIn: number
  fadeOut: number
  sound: number
  volume: number
  fadeTimer: NodeJS.Timeout | null
  muted: boolean
  playbackRate: number
  fade: boolean
  _startTime: number
  _stopTime: number
  endTime: number
  startTime: number
  duration: number
  materialId: string
  metaData: IAudioTrackItem
  format: string
  playRate?: number
  audioSpeaker?: string
  _attributes: {
    volume: number
  }
}


export interface Transform {
  translate: [number, number, number] // x, y ,z  例如：[0.5,0.5] 表示居中
  rotate: [number, number, number] // x, y, z
  scale: [number, number, number] // x,y,z
}


export interface IVideoTrackItem extends TrackItem {
  segmentId?: string // 片段ID
  format:  MATERIAL_TYPE.VIDEO | MATERIAL_TYPE.IMAGE
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

export interface IPhotoTrackItem extends TrackItem {
  format: MATERIAL_TYPE.IMAGE | MATERIAL_TYPE.GIF
  desc: string // 贴图描述
  width: number // 贴图宽度
  height: number // 贴图高度
  transform?: Transform // 变换
  duration: number // 素材时长
  crop: {
    x0: number
    x1: number
    y0: number
    y1: number
  }
}
export interface PhotoTrack {
  trackType: 'photo' // 轨道类型
  children: IPhotoTrackItem[] // 视频列表
  trackId: string
  hide: boolean
}

export type ITrack = (VideoTrack | BgmAudioTrack | PhotoTrack) // 轨道列表

export interface ITrackInfo {
  width: number // 导出视频的宽度
  height: number // 导出视频的高度， // 切换画笔比例，只修改width值，height保持不变
  duration: number // 总时长
  fps?: number // 帧率
  tracks: ITrack[] // 轨道列表
}

export type ISourceNode = IVideoNode | IPhotoNode | IAudioNode
