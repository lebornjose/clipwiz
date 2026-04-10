
import VideoContext from './videocontext.js'
import { ITrackInfo, ITrack, MATERIAL_TYPE, IAudioTrackItem, STATE, IPhotoTrackItem } from '@clipwiz/shared'
import { addVideoNode } from './components/video'
import { addBgm } from './components/audio'
import { addPhotoNode } from './components/photo'
import { getGifImage } from './components/getBufferImage'
import Pag from './components/Pag.js'
import { addSubtitleNode } from './components/subtitle.js'
import { addTextNode } from './components/text.js'
import { addFilter, FilterEffect } from './components/filter.js'

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

  public canvasWidth: number
  public canvasHeight: number
  // public currentTime: number // 当前时间
  public setState: (state: object) => void
  public setProgress: (time: number) => void
  public gifCanvasEl: HTMLCanvasElement = document.createElement('canvas')
  public pag: Pag
  public transitionMap: Map<string, any> // 记录转场
  public filterEffects: FilterEffect[]    // 滤镜效果列表

  public addNodeFunc: {
    [key: string]: Function
  }
  // gif 素材缓存
  public gifSources: {
    [key: string]: {
      frameCount: number
      imageDecoder: any
      trackData: Map<number, { imageData?: ImageData; codedWidth: number; codedHeight: number }>
    }
  } = {}

    // 一个临时的存储空间，用来存储图片或者pag，这样不需要每一帧发生变化的素材data
  public imageCatch: {
    [key: string]: ImageData
  } = {}

  constructor(options: IApplicationOptions) {
    this.gifSources = {}
    this.imageCatch = {}
    this.videoCtx = new VideoContext(options.canvas)
    this.isWaiting = false
    this.totalTime = options.trackInfo.duration
    this.videoTrack = options.trackInfo.tracks.reverse()
    this.transitionMap = new Map()
    this.filterEffects = []
    this.canvasHeight = options.trackInfo.height
    this.canvasWidth = options.trackInfo.width
    // this.currentTime = 0
    this.setState = options.setState
    this.setProgress = options.setProgress
    this.pag = new Pag();
    this.addNodeFunc = {
      [MATERIAL_TYPE.VIDEO]: addVideoNode,
      [MATERIAL_TYPE.BGM_AUDIO]: addBgm,
      [MATERIAL_TYPE.PHOTO]: addPhotoNode,
      [MATERIAL_TYPE.SUBTITLE]: addSubtitleNode,
      [MATERIAL_TYPE.TEXT]: addTextNode,
      [MATERIAL_TYPE.FILTER]: addFilter,
    }
    this.init()
  }

    // 设置时间
  setProcess(val: number) {
    if (this.videoCtx.state === STATE.PLAYING) {
      // this.isPlayingWaiting = true
      this.videoCtx.pause()
    }
    this.resetFilters()
    return new Promise(() => {
      let time = val
      // 这个是最后一帧时间会注销到video元素，导致黑屏出现，所以这次先处理位2位小数，
      if (val >= this.videoCtx.duration) {
        time = Math.floor(val * 100) / 100 // 保留2位
      }
      this.setProgress && this.setProgress(time)
      this.videoCtx.currentTime = time
      // 如果选中了没有视频的时间，则不会触发视频的loaded，这里防止无限loading和过长loading，添加一个关闭loading的
      // const clearLoading = setTimeout(() => {
      //   resolve(true)
      // }, 1500)
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


  async loadPhoto(item: any) {
    if (!this.gifSources[`gifSources${item.materialId || item.id!}`]) {
      const imageByteStream = await fetch(item.url)
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const imageDecoder: any = new ImageDecoder({
        data: imageByteStream.body as ImageBufferSource,
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
  loadTrack() {
    console.log(this.videoTrack)
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
        if ([MATERIAL_TYPE.ORAL_AUDIO, MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.VIDEO].includes(track.trackType as MATERIAL_TYPE)) {
          track.children.forEach((child) => {
            const c = child as IAudioTrackItem
            if (c.volume === undefined) {
              c.volume = c.muted ? 0 : 1 // 只有 volume 不存在的时候才设置默认值
            }
          })
        }
        if ((child as IPhotoTrackItem).format === MATERIAL_TYPE.GIF) {
          void this.loadPhoto(child as IPhotoTrackItem)
        }
        this.addNodeFunc[track.trackType](this, track.trackId, child)
      })
    }
  }

  init() {
    this.loadTrack()
  }

  /**
   * 每帧管理滤镜状态：进入/退出滤镜时间区间时切换节点连接关系
   */
  manageFilters() {
    const time = this.videoCtx.currentTime
    const sourceNodes = this.videoCtx._sourceNodes

    for (const filter of this.filterEffects) {
      const inRange = time >= filter.startTime && time < filter.endTime

      // EffectNode 只有单输入槽，只对 VIDEO 节点施加滤镜
      // PHOTO/GIF/字幕/花字等 canvas 节点保持直连 destination，不受影响
      const isFilterable = (node: any) =>
        node.type === MATERIAL_TYPE.VIDEO &&
        node.startTime <= time &&
        node.stopTime > time

      if (inRange && !filter.active) {
        // 进入滤镜区间：videoNode 路由到 effectNode，effectNode 以原 zIndex 接入 destination
        filter.active = true
        sourceNodes.forEach((node: any) => {
          if (isFilterable(node)) {
            const conns: any[] = (this.videoCtx as any)._renderGraph.getZIndexInputsForNode(this.videoCtx.destination)
            const conn = conns.find((c: any) => c.source === node)
            const originalZIndex = conn ? conn.zIndex : 0
            node.disconnect()
            node.connect(filter.effectNode)
            // effectNode 以视频节点原来的 zIndex 接入 destination，保持渲染层级
            filter.effectNode.connect(this.videoCtx.destination, originalZIndex)
            filter.routedNodes.set(node, originalZIndex)
          }
        })
      } else if (!inRange && filter.active) {
        // 离开滤镜区间：effectNode 断开，videoNode 以原始 zIndex 恢复到 destination
        filter.active = false
        filter.effectNode.disconnect(this.videoCtx.destination)
        filter.routedNodes.forEach((originalZIndex: number, node: any) => {
          node.disconnect(filter.effectNode)
          node.connect(this.videoCtx.destination, originalZIndex)
        })
        filter.routedNodes.clear()
      } else if (inRange && filter.active) {
        // 仍在滤镜区间内：补路由新进入的活跃节点
        sourceNodes.forEach((node: any) => {
          if (isFilterable(node) && !filter.routedNodes.has(node)) {
            const conns: any[] = (this.videoCtx as any)._renderGraph.getZIndexInputsForNode(this.videoCtx.destination)
            const conn = conns.find((c: any) => c.source === node)
            const originalZIndex = conn ? conn.zIndex : 0
            node.disconnect()
            node.connect(filter.effectNode)
            filter.routedNodes.set(node, originalZIndex)
          }
        })
      }
    }
  }

  /**
   * seek 时重置所有滤镜状态，让 manageFilters 在下一帧重新判断
   */
  resetFilters() {
    for (const filter of this.filterEffects) {
      if (filter.active) {
        filter.effectNode.disconnect(this.videoCtx.destination)
        filter.routedNodes.forEach((originalZIndex: number, node: any) => {
          node.disconnect(filter.effectNode)
          node.connect(this.videoCtx.destination, originalZIndex)
        })
        filter.routedNodes.clear()
        filter.active = false
      }
    }
  }

  async draw() {
    this.manageFilters()
    const currentTime = this.videoCtx.currentTime
    const sourceNodes = this.videoCtx._sourceNodes
    const nodes = sourceNodes.filter((item) => {
      return currentTime >= item.startTime && currentTime < item.stopTime && item._elementType !== 'audio' && item.type !== 'subtitle'
    })

    // 处理 GIF 动画帧更新
    const gifUpdatePromises = nodes
      .filter((item) => item.type === MATERIAL_TYPE.PHOTO && item.format === MATERIAL_TYPE.GIF)
      .map(async (item) => {
        const data = await getGifImage(this, item, this.gifCanvasEl)
        if (data && item.ctx) {
          item.ctx.putImageData(data, 0, 0)
        }
      })

    // 等待所有 GIF 帧更新完成
    await Promise.all(gifUpdatePromises)
  }

  start(){
    const toStart = async () => {
      this.setProgress && this.setProgress(this.videoCtx.currentTime)
      // 因为在项目的开始，如果恰好遇到连续的2帧时间则会出现刚开始的出现黑屏
      await this.draw()
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
      void this.setProgress(0)
    }
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
    this.resetFilters()
    this.videoCtx.currentTime = time
    this.setProgress(time)
    this.draw()
  }

  setVolume(volume: number) {
    // 设置所有音频节点的音量
    this.videoCtx.volume = volume
  }
}
