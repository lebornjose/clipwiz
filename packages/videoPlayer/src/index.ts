import VideoContext from './videocontext.js'

export class Editor {
  private videoCtx: VideoContext
  public isWaiting: boolean // 是否在视频加载中，该状态不允许播放

  constructor(options: { canvas: HTMLCanvasElement }) {
    this.videoCtx = new VideoContext(options.canvas)
    this.isWaiting = false;
  }

}
