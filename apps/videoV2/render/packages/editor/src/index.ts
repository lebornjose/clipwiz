// import { InitVisualisations } from './utils/track.js'
import type { IApplication } from '@van-gogh/video-render-core-v2'
import { Application } from '@van-gogh/video-render-core-v2'
import type {
  ACTION,
  IApplicationOptions,
  IAudioTrackItem,
  ICommandContext,
  IEventSubscribe,
  IFontInfo,
  IMaterial,
  IMaterials,
  IPhotoTrackItem,
  ISubtitleTrackItem, ITextTrackItem, ITrack, ITrackInfo, IVideoCtx, IVideoNode, IVideoTrackItem,
} from '@van-gogh/video-render-constants'
import {
  MATERIAL_TYPE,
  MOVIE_EVENT_TYPE,
  STATE,
  timeConfig,
} from '@van-gogh/video-render-constants'
import getMaterials from './components/getMaterials'
import { addVideoNode } from './components/video'
import { addPag } from './components/pag'
import { addText } from './components/text'
import { addPhoto } from './components/photo'
import { addAudio, addBgm } from './components/audio'
import { EventSubscribe } from './components/subscribe'
import type { ICommand } from './command/index'
import { Command } from './command/index'
import { addSound } from './components/sound'
import VideoContext from './videocontext.js'
import bluetoothVolume from './utils/bluetoothVolume'
import { setTransition, hideAllTransition } from './components/transition'
import { debounce } from '@van-gogh/utils/general'
import { PAGFile } from '@van-gogh/video-render-display-v2/src/pag/pag-file'

export class Editor {
  public movie: IApplication | undefined
  public videoCtx: IVideoCtx
  public videoTrack: ITrack[] = []
  public canvasEl: HTMLCanvasElement = document.createElement('canvas')
  public gifCanvasEl: HTMLCanvasElement = document.createElement('canvas')
  public canvasWidth: number
  public canvasHeight: number
  public currentView: HTMLCanvasElement
  public subscribeUtil: IEventSubscribe
  public pagMaterials: Array<ISubtitleTrackItem> = []
  public setProgress: (time: number) => void
  public pagSources: {
    [key: string]: PAGFile
  }

  public gifSources: {
    [key: string]: {
      frameCount: number
      imageDecoder: any
      trackData: Map<number, { imageData?: ImageData; codedWidth: number; codedHeight: number }>
    }
  } = {}

  public commonEffectSources: Record<string, string> = {}

  public isPlayingWaiting: boolean
  public setState: (state: object) => void
  // 一个临时的存储空间，用来存储图片或者pag，这样不需要每一帧发生变化的素材data
  public imageCatch: {
    [key: string]: ImageData
  }

  public commandFun: ICommand
  public fontList: Array<IFontInfo>
  public isWaiting: boolean // 是否在视频加载中，该状态不允许播放
  public addNodeFunc: {
    [key: string]: Function
  }
  public transitionImageData: {
    [key: string]: ImageData
  }

  public totalTime: number // 协议总时长 用来限制播放结束时间
  protocol: ITrackInfo
  queueDraw: () => void

  constructor(options: IApplicationOptions) {
    this.pagSources = {}
    this.imageCatch = {}
    this.gifSources = {}
    this.transitionImageData = {}
    this.addNodeFunc = {
      [MATERIAL_TYPE.VIDEO]: addVideoNode,
      [MATERIAL_TYPE.DIGITAL_VIDEO]: addVideoNode,
      [MATERIAL_TYPE.BGM_AUDIO]: addBgm,
      [MATERIAL_TYPE.ORAL_AUDIO]: addAudio,
      [MATERIAL_TYPE.PHOTO]: addPhoto,
      [MATERIAL_TYPE.TEXT]: addText,
      [MATERIAL_TYPE.SUBTITLE]: addPag,
      [MATERIAL_TYPE.SOUND_AUDIO]: addSound,
      [MATERIAL_TYPE.BACKGROUND]: addVideoNode,
    }
    this.canvasHeight = options.trackInfo.height
    this.canvasWidth = options.trackInfo.width
    this.setProgress = options.setProgress
    this.setState = options.setState
    this.fontList = options.fontList
    this.protocol = options.trackInfo
    this.videoCtx = new VideoContext(options.wasmView || document.createElement('canvas'))
    this.currentView = options.view
    this.videoTrack = options.trackInfo.tracks
    this.totalTime = options.trackInfo.duration
    this.subscribeUtil = new EventSubscribe()
    this.isWaiting = false
    this.isPlayingWaiting = false

    void this.init({ wasmUrl: options.wasmUrl })
    this.commandFun = new Command(this)
    this.queueDraw = debounce(this.draw, 50)

    try {
      if (import.meta.env.DEV) {
        // @ts-ignore
        let _hxEditor = window._hxEditor as Map<HTMLCanvasElement, Editor>
        if (!_hxEditor) {
          // @ts-ignore
          _hxEditor = window._hxEditor = new Map<HTMLCanvasElement, Editor>()
        }
        _hxEditor.set(this.currentView, this)
      }
    } catch (e) { }
  }

  async loadItemPag(item: IMaterial) {
    // TODO 害怕协议万一没有materialId 则随机生成一个
    // let materialId = item.materialId || Math.random().toString(36).slice(2)
    // if (item.format === 'pag') {
    //   materialId = item.id || Math.random().toString(36).slice(2)
    // }
    const id = item.id
    if (!id) {
      return
    }
    if (!this.pagSources[`pagSources${id}`]) {
      const pagFileIns = await this.movie?.stage?.addFile(item.url)
      if (pagFileIns) {
        this.pagSources[`pagSources${id}`] = pagFileIns
      }
    }
  }

  async loadTextPag(item: { url: string; id: string }) {
    const pagFileIns = await this.movie?.stage?.addFile(item.url)
    if (!pagFileIns) {
      return
    }
    this.pagSources[`pagSources${item.id}`] = pagFileIns
  }

  // 需要load pag 文件
  async loadPag() {
    for (const item of this.pagMaterials) {
      await this.loadItemPag(item)
    }
  }

  async loadPhoto(item: IMaterial) {
    if (!this.gifSources[`gifSources${item.materialId || item.id!}`]) {
      const imageByteStream = await fetch(item.url)
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const imageDecoder: any = new ImageDecoder({
        data: imageByteStream.body,
        type: 'image/gif',
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await imageDecoder.tracks.ready
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await imageDecoder.completed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const frameCount: number = imageDecoder.tracks.selectedTrack.frameCount
      this.gifSources[`gifSources${item.materialId || item.id!}`] = { frameCount, imageDecoder, trackData: new Map() }
    }
  }

  convertEndTime(child: ISubtitleTrackItem | IVideoTrackItem | IAudioTrackItem | IPhotoTrackItem | ITextTrackItem) {
    if (child.endTime > this.totalTime) {
      child.endTime = this.totalTime
    }
  }

  loadTrack() {
    // TODO 这个是为了解决贴图会盖住字幕的问题，但是产品说不用解决
    // 需要把字幕放在最后一列去做渲染
    // const inx = this.videoTrack.findIndex((row) => {
    //   return row.trackType === MATERIAL_TYPE.SUBTITLE
    // })
    // if (inx !== this.videoTrack.length - 1) {
    //   this.videoTrack.push(this.videoTrack[inx])
    //   this.videoTrack.splice(inx, 1)
    // }
    for (const track of this.videoTrack) {
      track.children?.forEach((child) => {
        if (track.hide) {
          child.hide = track.hide
        }
        if ([MATERIAL_TYPE.ORAL_AUDIO, MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.VIDEO].includes(track.trackType)) {
          track.children.forEach((child) => {
            const c = child as IAudioTrackItem
            if (c.volume === undefined) {
              c.volume = c.muted ? 0 : 1 // 只有 volume 不存在的时候才设置默认值
            }
          })
        }
        this.addNodeFunc[track.trackType](this, track.trackId, child)
        if ([MATERIAL_TYPE.TEXT, MATERIAL_TYPE.SUBTITLE].includes(track.trackType)) {
          this.pagMaterials.push(child as ISubtitleTrackItem)
        }
        if ((child as IPhotoTrackItem).format === MATERIAL_TYPE.GIF) {
          void this.loadPhoto(child as IPhotoTrackItem)
        }
      })
    }
    // 一次性加载Pag
    void this.loadPag()
    // 修复蓝牙信号导致一些短音频出现语音漏字和未播放的情况
    bluetoothVolume(this.videoCtx, this.videoCtx.duration)
    this.videoCtx.registerCallback(MOVIE_EVENT_TYPE.ENDED, () => {
      this.isWaiting = false
      this.isPlayingWaiting = false
      this.videoCtx.pause()
      this.setState && this.setState({ playing: false })
    })
    // InitVisualisations(this.videoCtx, "graph-canvas", "visualisation-canvas");
  }

  async init(opt?: { wasmUrl?: string }) {
    this.movie = await Application.create({
      width: this.canvasWidth,
      height: this.canvasHeight,
      view: this.currentView,
      pagEnabled: true,
      useAudio: true,
      fontConfigUrl: 'https://fonts-cmp-2-0.oss-cn-hangzhou.aliyuncs.com/fonts.json',
      wasmUrl: opt?.wasmUrl,
      videoCtx: this.videoCtx,
    }) as IApplication

    this.fontList && await this.addFont([])
    this.movie.renderer?.renderInit(this.protocol)
    // 实例化画布
    this.loadTrack()
  }

  async addFont(fontList: Array<IFontInfo>) {
    let list = fontList
    if (!list.length) {
      list = this.fontList
    }
    for (const item of list) {
      if (!item.fontSpec) {
        continue
      }
      await this.movie?.addFont({
        FontFamily: item.fontFamily,
        FontType: item.fontSpec,
      })
    }
    if (fontList.length) {
      this.movie?.renderer?.addFont()
      void this.queueDraw()
    }
  }

  start() {
    const toStart = async () => {
      this.setProgress && this.setProgress(this.currentTime > this.videoCtx.duration ? this.videoCtx.duration : this.currentTime)
      // 因为在项目的开始，如果恰好遇到连续的2帧时间则会出现刚开始的出现黑屏
      if (this.currentTime < 0.5) {
        await this.draw()
      } else {
        if (Math.trunc(this.currentTime * timeConfig.MILL_TIME_CONVERSION) % 2 === 0) {
          await this.draw()
        }
      }
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
      void this.setProcess(0)
    }
    this.videoCtx.play()
    this.start()
  }

  setMute(mute: boolean) {
    mute ? (this.videoCtx.volume = 0) : (this.videoCtx.volume = 1)
  }

  // 设置时间
  setProcess(val: number) {
    if (this.videoCtx.state === STATE.PLAYING) {
      this.isPlayingWaiting = true
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
      }, 1000)
      this.subscribeUtil.once('video_seek_success', () => {
        if (this.isPlayingWaiting) {
          this.isPlayingWaiting = false
          this.play()
        }
        clearTimeout(clearLoading)
        resolve(true)
      })
    })
  }

  pause() {
    // 暂停的时候需要时间刚好为 40毫秒的背数，这样才能哈好在对应时间的那一帧上
    let time = Math.trunc(this.videoCtx.currentTime * timeConfig.MILL_TIME_CONVERSION)
    const manyTime = time % timeConfig.FRAME_TIME_MILL
    if (manyTime) {
      time += timeConfig.FRAME_TIME_MILL - manyTime
    }
    this.videoCtx.currentTime = time / timeConfig.MILL_TIME_CONVERSION
    this.setProgress && this.setProgress(this.videoCtx.currentTime)
    this.isWaiting = false
    this.isPlayingWaiting = false
    this.videoCtx.pause()
  }

  nextFrame() {
    this.videoCtx.currentTime += timeConfig.FRAME_TIME
  }

  prevFrame() {
    if (this.videoCtx.currentTime >= timeConfig.FRAME_TIME) {
      this.videoCtx.currentTime -= timeConfig.FRAME_TIME
    }
  }

  // load数据ts
  resetProtocol(trackInfo: ITrackInfo) {
    return new Promise((resolve) => {
      // temporaryPag = {} // 清空pag
      this.imageCatch = {}
      this.pagSources = {}
      this.setProgress && this.setProgress(0)
      this.videoCtx.pause()
      this.videoCtx.reset()
      this.canvasHeight = trackInfo.height
      this.canvasWidth = trackInfo.width
      this.videoTrack = trackInfo.tracks
      this.totalTime = trackInfo.duration
      this.movie?.renderer?.renderDestroy()
      this.movie?.renderer?.renderInit(trackInfo)
      this.loadTrack()
      this.subscribeUtil.once('video_loaded', () => {
        resolve(this.videoCtx.duration)
      })
    })
  }

  // 销毁
  destroy() {
    this.imageCatch = {}
    this.gifSources = {}
    this.commonEffectSources = {}
    this.setProgress && this.setProgress(0)
    this.movie?.renderer?.renderDestroy()
    this.movie?.destroy()
    this.videoCtx.reset()
    this.videoTrack = []
    this.movie = undefined
    this.pagMaterials = []
  }

  frameData() {
    const canvas = document.createElement('canvas')
    canvas.width = this.canvasWidth
    canvas.height = this.canvasHeight
    canvas.style.width = `${this.canvasWidth}px`
    canvas.style.height = `${this.canvasHeight}px`

    const ctx = canvas.getContext('2d')
    const pixel = this.movie?.renderer?.readPixels()
    if (!ctx || !pixel) {
      throw new Error('拿不到像素数据')
    }
    const imageData = new ImageData(canvas.width, canvas.height)

    imageData.data.set(pixel as ArrayLike<number>)
    ctx.putImageData(imageData, 0, 0)
    const dataUrl = canvas.toDataURL()
    return dataUrl
  }

  // 给编辑器发送命令， 做对应的修改
  // eslint-disable-next-line @typescript-eslint/require-await
  async commandFunc(type: ACTION, item: ICommandContext) {
    this.commandFun.init(type, item)
  }
  // 将当前元素绘画到canvas
  draw() {
    return new Promise((resolve) => {
      hideAllTransition(this)
      getMaterials(this, (arr) => {
        if (!arr.length) {
          return resolve(true)
        }
        this.movie?.renderer?.hideAllNodeLayer()
        arr.forEach((item: IMaterials) => {
          this.movie?.renderer?.bindVideoCtxNodeToTrackNode(item)
          const videoTrack = item.node.metaData as IVideoTrackItem
          // 排除数字人的影响
          if (item.type === 'img' && !videoTrack.webExtend?.isDigitalHuman) {
            if (item.node.pipParams?.transitionIn || item.node.pipParams?.transitionOut || item.node.imageData) {
              setTransition(this, item)
            } else {
              hideAllTransition(this)
            }
          }
          switch (item.type) {
            case 'img':
            case MATERIAL_TYPE.PHOTO:
              this.movie?.renderer?.drawImageLayer(item)
              break
            case MATERIAL_TYPE.SUBTITLE:
            case MATERIAL_TYPE.TEXT:
              this.movie?.renderer?.drawPagLayer(item)
              break
            default:
              console.log('default')
              break
          }
        })

        // arr.forEach((item: IMaterials) => {
        //   if (item.type === 'img') {
        //     // this.movie?.renderer?.drawImage(item.node, item.imageData as ImageData, item.commonEffects, wasmDrawTime)
        //     if (item.node.pipParams?.transitionIn || item.node.pipParams?.transitionOut) {
        //       setTransition(this, item)
        //     }
        //   } else if (item.type === MATERIAL_TYPE.PHOTO) {
        //     // this.movie?.renderer?.drawImage(item.node, item.imageData as ImageData, item.commonEffects, wasmDrawTime)
        //   }
        //   if ([MATERIAL_TYPE.SUBTITLE, MATERIAL_TYPE.TEXT].includes(item.type)) {
        //     // const processRate = utils.animationRate(this.videoCtx.currentTime, item.node)
        //     // item?.pag && this.movie?.renderer?.drawPag(item.pag, item.node.pipParams, processRate, wasmDrawTime)
        //   }
        // })
        void this.movie?.renderer?.draw()
        resolve(true)
      })
    })
  }

  getProtocolStr() {
    return this.movie?.renderer?.dumpCmp2Content()
  }

  // @ts-ignore
  get currentTime() {
    return this.videoCtx.currentTime
  }

  get editor() {
    return this.videoCtx
  }

  // @ts-ignore
  get duration() {
    return new Promise<number>((resolve) => {
      if (this.videoCtx.duration) {
        resolve(this.videoCtx.duration)
      } else {
        this.subscribeUtil.once('video_loaded', () => {
          resolve(this.videoCtx.duration)
        })
      }
    })
  }
}

export { VideoContext, bluetoothVolume }
