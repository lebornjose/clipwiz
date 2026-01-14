
import VideoContext from './videocontext'
import { ITrackInfo, ITrack, MATERIAL_TYPE, IAudioTrackItem, STATE } from '@clipwiz/shared'
import { addVideoNode } from './components/video'

export interface IApplicationOptions {
  view: HTMLCanvasElement
  trackInfo: ITrackInfo
  setProgress: (time: number) => void
  setState: (state: Object) => void
}
export class Editor {
  public videoCtx: VideoContext
  public isWaiting: boolean // 是否在视频加载中，该状态不允许播放
  public totalTime: number // 总时长
  public videoTrack: ITrack[]
  public currentTime: number // 当前时间
  public setState: (state: object) => void
  public addNodeFunc: {
    [key: string]: Function
  }

  constructor(options: { canvas: HTMLCanvasElement, trackInfo: ITrackInfo, setState: (state: object) => void }) {
    this.videoCtx = new VideoContext(options.canvas)
    this.isWaiting = false;
    this.totalTime = options.trackInfo.duration
    this.videoTrack = options.trackInfo.tracks
    this.currentTime = 0
    this.setState = options.setState
    this.addNodeFunc = {
      [MATERIAL_TYPE.VIDEO]: addVideoNode
    }
    console.log(this.videoCtx);
  }

  loadTrack() {
    for (const track of this.videoTrack) {
      track.children?.forEach((child) => {
        if (track.hide) {
          child.hide = track.hide
        }
        if ([MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.VIDEO].includes(track.trackType as MATERIAL_TYPE)) {
          track.children.forEach((child) => {
            const c = child as IAudioTrackItem
            if (c.volume === undefined) {
              c.volume = c.muted ? 0 : 1 // 只有 volume 不存在的时候才设置默认值
            }
          })
        }
        this.addNodeFunc[track.trackType](this, track.trackId, child)
      })
    }
  }

  init() {
    this.loadTrack()
  }

  play() {
    if (this.videoCtx.state === STATE.PLAYING) {
      return
    }
    if (this.videoCtx.currentTime >= this.videoCtx.duration) {
      this.videoCtx.currentTime = 0
      // void this.setProcess(0)
    }
    this.videoCtx.play()
    // this.start()
  }
}
