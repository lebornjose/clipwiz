import VideoContext from './videocontext.js'
import { ITrackInfo } from '@clipwiz/shared'

export interface IApplicationOptions {
  view: HTMLCanvasElement
  trackInfo: ITrackInfo
  setProgress: (time: number) => void
  setState: (state: Object) => void
}
export class Editor {
  private videoCtx: VideoContext
  public isWaiting: boolean // 是否在视频加载中，该状态不允许播放

  constructor(options: { canvas: HTMLCanvasElement }) {
    this.videoCtx = new VideoContext(options.canvas)
    this.isWaiting = false;

    console.log(this.videoCtx);
  }
}
