
import VideoContext from './videocontext.js'
import { ITrackInfo, ITrack, MATERIAL_TYPE, IAudioTrackItem, ISubtitleTrackItem, ITextTrackItem, STATE, IPhotoTrackItem, IVideoNode, IVideoTrackItem, resolveTransitionBetweenItems, TransitionItem, Transform, TIME_CONFIG } from '@clipwiz/shared'
import { addVideoNode } from './components/video'
import { addAudio, addBgm } from './components/audio'
import { addPhotoNode } from './components/photo'
import { getGifImage } from './components/getBufferImage'
import Pag from './components/Pag.js'
import { addSubtitleNode, SubtitleBinding } from './components/subtitle.js'
import { addTextNode, TextBinding } from './components/text.js'
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
  public transitionRegistry: Map<string, {
    node: any
    transition: TransitionItem
    durationSec: number
    overlapStart: number  // seconds in VideoContext timeline
    overlapEnd: number    // seconds in VideoContext timeline
    prevNodeId: string
    currentNodeId: string
    phase: 'pre' | 'transition' | 'post' | 'reset' // current routing state ('reset' = pending reconnect)
  }>
  public videoNodeRegistry: Map<string, IVideoNode>
  public subtitleRegistry: Map<string, SubtitleBinding>
  public textRegistry: Map<string, TextBinding>
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
    this.transitionRegistry = new Map()
    this.videoNodeRegistry = new Map()
    this.subtitleRegistry = new Map()
    this.textRegistry = new Map()
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
      [MATERIAL_TYPE.SOUND_AUDIO]: addAudio,
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
    this.resetTransitions()
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

  getTransitionDefinition(item?: TransitionItem) {
    const definitions = (VideoContext as any).DEFINITIONS || {}
    if (item) {
      // Look up by effectId or name (case-insensitive, support both "STAR_WIPE" and "star_wipe")
      const byEffectId = item.effectId ? definitions[item.effectId.toUpperCase()] : undefined
      const byName = item.name ? definitions[item.name.toUpperCase()] : undefined
      if (byEffectId) return byEffectId
      if (byName) return byName
    }
    return definitions.CROSSFADE || definitions.DREAMFADE
  }

  registerVideoTransition(prevItem: IVideoTrackItem | undefined, currentItem: IVideoTrackItem, currentNode: IVideoNode) {
    if (!prevItem) return

    const resolved = resolveTransitionBetweenItems(prevItem, currentItem)
    if (!resolved) return

    const definition = this.getTransitionDefinition(resolved.transition)
    if (!definition) return

    const prevNode = this.videoNodeRegistry.get(prevItem.id)
    if (!prevNode) return

    // Overlap window comes directly from the data model:
    //   currentItem.startTime = when clip2 enters the timeline = transition start
    //   prevItem.endTime      = when clip1 leaves the timeline = transition end
    // The two clips are expected to have overlapping time ranges in the data.
    const overlapStart = currentItem.startTime / 1000
    const overlapEnd = prevItem.endTime / 1000
    if (overlapEnd <= overlapStart) return

    const durationSec = overlapEnd - overlapStart
    const key = resolved.key

    // Create the VideoContext transition node for this pair
    const transitionNode = this.videoCtx.transition(definition)
    // Schedule mix 0→1 over the blend window (absolute timeline times)
    ;(transitionNode as any).transitionAt(overlapStart, overlapEnd, 0, 1, 'mix')
    this.transitionMap.set(key, transitionNode)

    // addVideoNode already called currentNode.start(currentItem.startTime/1000),
    // so the VideoContext startTime is already correct — no adjustment needed.

    // Disconnect currentNode from destination: it must NOT be visible before the transition
    // (its VideoContext texture is cleared while in sequenced state anyway, but keeping it
    // off destination avoids any edge-case compositing with alpha blending).
    ;(currentNode as any).disconnect(this.videoCtx.destination)

    // Phase "pre": prevNode is already connected to destination from addVideoNode.
    this.transitionRegistry.set(key, {
      node: transitionNode,
      transition: resolved.transition,
      durationSec,
      overlapStart,
      overlapEnd,
      prevNodeId: prevItem.id,
      currentNodeId: currentItem.id,
      phase: 'pre',
    })
  }

  /**
   * Per-frame connection management.
   * pre:        prevNode → destination
   * transition: prevNode + currentNode → transitionNode → destination
   * post:       currentNode → destination
   *
   * Idempotent: only reconnects on phase change.
   */
  manageTransitions() {
    const time = this.videoCtx.currentTime

    this.transitionRegistry.forEach((registry) => {
      const prevNode = this.videoNodeRegistry.get(registry.prevNodeId)
      const currentNode = this.videoNodeRegistry.get(registry.currentNodeId)
      if (!prevNode || !currentNode) return

      const { overlapStart, overlapEnd, node: transitionNode } = registry
      const dest = this.videoCtx.destination

      if (time < overlapStart && registry.phase !== 'pre') {
        // Seek back before transition
        ;(currentNode as any).disconnect(dest)
        ;(currentNode as any).disconnect(transitionNode)
        ;(prevNode as any).disconnect(transitionNode)
        transitionNode.disconnect(dest)
        ;(prevNode as any).connect(dest, 0)  // zIndex=0: video as background, overlays render on top
        registry.phase = 'pre'
      } else if (time >= overlapStart && time < overlapEnd && registry.phase !== 'transition') {
        // Enter transition window
        ;(prevNode as any).disconnect(dest)
        ;(currentNode as any).disconnect(dest)
        prevNode.connect(transitionNode)
        currentNode.connect(transitionNode)
        transitionNode.connect(dest, 0)  // zIndex=0: video blend as background
        registry.phase = 'transition'
      } else if (time >= overlapEnd && registry.phase !== 'post') {
        // Exit transition window
        ;(prevNode as any).disconnect(transitionNode)
        ;(currentNode as any).disconnect(transitionNode)
        transitionNode.disconnect(dest)
        ;(currentNode as any).connect(dest, 0)  // zIndex=0: video as background
        registry.phase = 'post'
      }
    })
  }

  /**
   * Force-reset all transition routing to match current time (called on seek).
   */
  resetTransitions() {
    this.transitionRegistry.forEach((registry) => {
      const prevNode = this.videoNodeRegistry.get(registry.prevNodeId)
      const currentNode = this.videoNodeRegistry.get(registry.currentNodeId)
      if (!prevNode || !currentNode) return

      const { node: transitionNode } = registry
      const dest = this.videoCtx.destination

      // Tear down all connections for this pair
      ;(prevNode as any).disconnect(dest)
      ;(prevNode as any).disconnect(transitionNode)
      ;(currentNode as any).disconnect(dest)
      ;(currentNode as any).disconnect(transitionNode)
      transitionNode.disconnect(dest)
      // Sentinel: 'reset' never matches 'pre'/'transition'/'post', so manageTransitions
      // will always re-evaluate and reconnect on the next draw() call.
      registry.phase = 'reset'
    })
  }

  loadTrack() {
    console.log(this.videoTrack)
    for (const track of this.videoTrack) {
      track.children?.forEach((child, childIndex) => {
        if ([MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.SOUND_AUDIO, MATERIAL_TYPE.VIDEO].includes(track.trackType as MATERIAL_TYPE)) {
          track.children.forEach((child) => {
            const c = child as IAudioTrackItem
            if (c.volume === undefined) {
              c.volume = c.muted ? 0 : 1 // 只有 volume 不存在的时候才设置默认值
            }
          })
        }
        if ([MATERIAL_TYPE.ORAL_AUDIO, MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.SOUND_AUDIO, MATERIAL_TYPE.VIDEO].includes(track.trackType as MATERIAL_TYPE)) {
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
        const node = this.addNodeFunc[track.trackType](this, track.trackId, child)
        if (track.trackType === MATERIAL_TYPE.VIDEO && node) {
          const currentItem = child as IVideoTrackItem
          this.videoNodeRegistry.set(currentItem.id, node as IVideoNode)
          const prevItem = childIndex > 0 ? track.children[childIndex - 1] as IVideoTrackItem : undefined
          this.registerVideoTransition(prevItem, currentItem, node as IVideoNode)
        }
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
    this.manageTransitions()
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
        const frame = await getGifImage(this, item, this.gifCanvasEl)
        if (frame?.imageData && item.ctx) {
          const dstCtx = item.ctx as CanvasRenderingContext2D
          const dstCanvas = (item as any)._photoCanvas as HTMLCanvasElement | undefined
          if (!dstCanvas) {
            dstCtx.putImageData(frame.imageData, 0, 0)
            return
          }
          // Keep GIF aspect ratio in preview to avoid stretching.
          const srcCanvas = document.createElement('canvas')
          srcCanvas.width = frame.codedWidth
          srcCanvas.height = frame.codedHeight
          const srcCtx = srcCanvas.getContext('2d')
          if (!srcCtx) return
          srcCtx.putImageData(frame.imageData, 0, 0)
          const scale = Math.min(dstCanvas.width / frame.codedWidth, dstCanvas.height / frame.codedHeight)
          const drawW = Math.max(1, Math.round(frame.codedWidth * scale))
          const drawH = Math.max(1, Math.round(frame.codedHeight * scale))
          const x = Math.round((dstCanvas.width - drawW) / 2)
          const y = Math.round((dstCanvas.height - drawH) / 2)
          dstCtx.clearRect(0, 0, dstCanvas.width, dstCanvas.height)
          dstCtx.drawImage(srcCanvas, x, y, drawW, drawH)
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
    this.resetTransitions()
    this.videoCtx.currentTime = time
    this.setProgress(time)
    this.draw()
  }

  setNodeTransform(id: string, transform: Transform) {
    const node =
      this.videoNodeRegistry.get(id) ||
      (this.videoCtx._sourceNodes.find((n: any) => n.id === id && n._elementType !== 'audio') as any)
    if (!node) return
    const item = (node as any).metaData || {}
    const isPhoto = (node as any).type === MATERIAL_TYPE.PHOTO
    const halfW = isPhoto
      ? (this.canvasWidth ?? 1920) / 2
      : (item.width ?? this.canvasWidth ?? 1920) / 2
    const halfH = isPhoto
      ? (this.canvasHeight ?? 1080) / 2
      : (item.height ?? this.canvasHeight ?? 1080) / 2
    ;(node as any).setTransform({
      scale: transform.scale[0] ?? 1,
      x: (transform.translate[0] ?? 0) / halfW,
      y: (transform.translate[1] ?? 0) / halfH,
    })
    this.forceRefreshCurrentFrame()
  }

  setAudioNodeProps(id: string, patch: Partial<IAudioTrackItem>) {
    const node = this.videoCtx._sourceNodes.find((n: any) => n.id === id && n._elementType === 'audio') as any
    if (!node) return

    const hasVolumePatch = patch.volume !== undefined
    const baseVolume =
      typeof node.sound === 'number'
        ? node.sound
        : (typeof node._attributes?.volume === 'number' ? node._attributes.volume : (node.volume ?? 1))
    const volume = Math.max(0, Math.min(1, hasVolumePatch ? (patch.volume as number) : baseVolume))
    const muted = patch.muted !== undefined
      ? patch.muted
      : (hasVolumePatch ? volume === 0 : Boolean(node.muted))
    const playRate = patch.playRate ?? node.playbackRate ?? 1

    node.sound = volume
    node.volume = muted ? 0 : volume
    node.muted = muted
    node.playbackRate = Math.min(playRate, 4)

    if (patch.fadeIn !== undefined) {
      node.fadeIn = Math.max(0, patch.fadeIn)
    }
    if (patch.fadeOut !== undefined) {
      node.fadeOut = Math.max(0, patch.fadeOut)
    }
    if (patch.endTime !== undefined) {
      node.stop(Math.max(0, patch.endTime) / TIME_CONFIG.MILL_TIME_CONVERSION)
    }

    void this.draw()
  }

  setSubtitleNodeProps(id: string, patch: Partial<ISubtitleTrackItem>) {
    const subtitle = this.subtitleRegistry.get(id)
    if (!subtitle) return
    subtitle.update(patch)
    this.forceRefreshCurrentFrame()
  }

  setTextNodeProps(id: string, patch: Partial<ITextTrackItem>) {
    const textBinding = this.textRegistry.get(id)
    if (!textBinding) return
    textBinding.update(patch)
    this.forceRefreshCurrentFrame()
  }

  private forceRefreshCurrentFrame() {
    const current = this.videoCtx.currentTime
    const epsilon = 1 / 1000
    // 在不改变用户可见时间的前提下，触发 VideoContext 重新采样当前帧
    this.videoCtx.currentTime = Math.max(0, current - epsilon)
    this.videoCtx.currentTime = current
    this.setProgress(current)
    void this.draw()
  }

  setVolume(volume: number) {
    // 设置所有音频节点的音量
    this.videoCtx.volume = volume
  }
}
