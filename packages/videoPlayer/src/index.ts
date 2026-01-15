
import VideoContext from './videocontext.js'
import { ITrackInfo, ITrack, MATERIAL_TYPE, IAudioTrackItem, STATE } from '@clipwiz/shared'
import { addVideoNode } from './components/video'

export interface IApplicationOptions {
  canvas: HTMLCanvasElement
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
  public setProgress: (time: number) => void
  public addNodeFunc: {
    [key: string]: Function
  }

  constructor(options: IApplicationOptions) {
    this.videoCtx = new VideoContext(options.canvas)
    this.isWaiting = false
    this.totalTime = options.trackInfo.duration
    this.videoTrack = options.trackInfo.tracks
    this.currentTime = 0
    this.setState = options.setState
    this.setProgress = options.setProgress
    this.addNodeFunc = {
      [MATERIAL_TYPE.VIDEO]: addVideoNode
    }
    console.log(this.videoCtx)
    this.init()
  }

    // 设置时间
    setProcess(val: number) {
      debugger
      if (this.videoCtx.state === STATE.PLAYING) {
        // this.isPlayingWaiting = true
        this.videoCtx.pause()
      }
      return new Promise((resolve) => {
        let time = val
        // 这个是最后一帧时间会注销到video元素，导致黑屏出现，所以这次先处理位2位小数，
        if (val >= this.videoCtx.duration) {
          time = Math.floor(val * 100) / 100 // 保留2位
        }
        this.setProgress && this.setProgress(time)
        this.videoCtx.currentTime = time
        // 如果选中了没有视频的时间，则不会触发视频的loaded，这里防止无限loading和过长loading，添加一个关闭loading的
        const clearLoading = setTimeout(() => {
          resolve(true)
        }, 1500)
        // this.subscribeUtil.once('video_seek_success', () => {
        //   if (this.isPlayingWaiting) {
        //     this.isPlayingWaiting = false
        //     this.play()
        //   }
        //   clearTimeout(clearLoading)
        //   resolve(true)
        // })
      })
    }

  loadTrack() {
    for (const track of this.videoTrack) {
      track.children?.forEach((child) => {
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

  start(){
    const toStart = async () => {
      this.setProgress && this.setProgress(this.currentTime > this.videoCtx.duration ? this.videoCtx.duration : this.currentTime)
      // 因为在项目的开始，如果恰好遇到连续的2帧时间则会出现刚开始的出现黑屏
      if (this.videoCtx.state === STATE.PLAYING || this.videoCtx.state === STATE.STALLED) {
        requestAnimationFrame(toStart.bind(this))
      }
    }
    requestAnimationFrame(toStart.bind(this))
  }

  play() {
    if (this.videoCtx.state === STATE.PLAYING) {
      return
    }
    if (this.videoCtx.currentTime >= this.videoCtx.duration) {
      this.videoCtx.currentTime = 0
      this.setProgress(0)
    }
    debugger
    this.videoCtx.play()
    this.start()
  }

  pause() {
    if (this.videoCtx.state !== STATE.PLAYING) {
      return
    }
    this.videoCtx.pause()
  }

  seek(time: number) {
    this.videoCtx.currentTime = time
    this.setProgress(time)
  }

  setVolume(volume: number) {
    // 设置所有音频节点的音量
    this.videoCtx.volume = volume
  }
}
