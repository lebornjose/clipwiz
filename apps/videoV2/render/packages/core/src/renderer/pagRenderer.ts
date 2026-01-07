import { IFontParams, RENDERER_TYPE, ITextLy, IPalette, IImgLayer, INode, MaterialCommonEffects, IPipParams, TextBasic, IRender, IModel, IColor, IPagFile, HelpFn, MATERIAL_TYPE, CommonEffects, ICommonEffect, IVideoNode, IPhotoNode, ISourceNode, IMaterials, IVideoCtx, ITrack, ITrackInfo, Transition, IVideoTrackItem } from '@van-gogh/video-render-constants'
import { BaseRenderer } from './baseRenderer'
import textUtil from './text'
import lutUtil from './lut'
import TrackTree, { ITrackNode, LAYER_TYPE } from './TrackTree'
import { get, isNumber } from 'lodash-es'
import utils from '@van-gogh/video-render-editor-v2/src/utils'

export interface IPagRendererOptions extends GlobalMixins.IBaseRenderOptions {
  repeatCount?: number
}

export class PAGRenderer extends BaseRenderer {
  private timer: number | null = null
  // 根路径
  private rootNode: any = null
  private trackTree: TrackTree | null = null
  constructor(options: IPagRendererOptions) {
    // 需要绘制序列帧，则先使用 不在文档流的 canvas 渲染
    // 绘制完成，在替换到 DOM 中
    super(RENDERER_TYPE.PAG, options)
  }
  static module: IModel | undefined

  bindModules(module: any) {
    module.PAGView = PAGRenderer
    PAGRenderer.module = module
  }

  bindVideoCtxNodeToTrackNode(item: IMaterials) {
    const { id } = item.node
    this.trackTree?.bindVideoCtxNode(id, item.node)
  }

  mallocUint8Img(data: any) {
    const dataPtr = PAGRenderer.module?._malloc(data.length)
    const dataOnHeap = new Uint8Array(
      PAGRenderer.module?.HEAPU8.buffer,
      dataPtr,
      data.length
    )
    dataOnHeap.set(data)
    return dataPtr
  }

  mallocUint8(canvasKit: any, data: ArrayLike<number>) {
    const dataPtr = canvasKit._malloc(data.length)
    const dataOnHeap = new Uint8Array(
      canvasKit.HEAPU8.buffer,
      dataPtr,
      data.length
    )
    dataOnHeap.set(data)
    return dataPtr
  }

  // 实例化画布
  renderInit(trackInfo: ITrackInfo, color?: IColor) {
    this.trackTree = new TrackTree()
    let canvasElement: HTMLCanvasElement | null = this.view;
    const gl = canvasElement.getContext('webgl2');
    const contextID = PAGRenderer.module?.GL.registerContext(gl, { majorVersion: 2, minorVersion: 0 });
    PAGRenderer.module?.GL.makeContextCurrent(contextID);
    const pagSurface = PAGRenderer.module?._PAGSurface._FromRenderTarget(0, canvasElement.width, canvasElement.height, true);

    try {
      this.rootNode = PAGRenderer.module?._BannerRootNode._MakeRoot(
        JSON.stringify(trackInfo),
        pagSurface
      )
      this.trackTree.createTree(this.rootNode)
      console.log('实例化画布成功')
    } catch (e) {
      console.log('初始化画布失败')
    }

    let bgColor = [0, 0, 0]
    if (color) {
      bgColor = color
    }
    this.rootNode._setCleanColor({ r: bgColor[0], g: bgColor[1], b: bgColor[2], a: 1 })
    // TODO 这个太离谱了，第一个初始化，需要把所有转场关闭
    // @谢炎飞
    this.hideAllTransition()
  }

  setCanvasBg(color: IColor) {
    this.rootNode._setCleanColor({ r: color[0], g: color[1], b: color[2], a: 1 })
    this.draw()
  }
  displayGroupLayer(trackId: string, operate: boolean) {
    this.trackTree?.findGroupNode(trackId)?.layer?._setLayerVisible(operate)
  }
  displayLayer(id: string, operate: boolean) {
    this.trackTree?.findNode(id)?.layer?._setLayerVisible(operate)
  }
  /**
   * 1. 判断是否已有paletteEffects，如果有则更新对象即可
   * 2. 如果没有，则创建新的对象，添加到图层中
   * 3. 没有唯一标识最对应，通过array的index来对应
   * @param palette 
   * @param node 
   */
  setImageLut(palette: IPalette, node: ISourceNode) {
    const trackNode = this.trackTree?.findNode(node.id);
    if (!trackNode) {
      return
    }
    const { layer, layerType, paletteEffectMap } = trackNode

    if (layerType !== LAYER_TYPE.image) {
      return
    }

    const _palettes = Array.isArray(palette) ? palette : [palette] // 兼容后续的数组，目前只有一个object
    const paletteEffects = Array.from(paletteEffectMap?.values() ?? [])
    let isNeedCreateTree = false
    // 支持删除
    if (paletteEffects.length > _palettes.length) {
      const diff = paletteEffects.length - _palettes.length
      for (let i = 0; i < diff; i++) {
        const effect = paletteEffects.pop()
        layer._removeEffect(effect)
      }
      isNeedCreateTree = true;
    }

    _palettes.forEach((p, i) => {
      const effect = paletteEffects?.[i]
      if (effect) {
        // 支持修改
        lutUtil.update(effect, p)
      } else {
        // 支持新增
        const newPalette = layer._MakeEffect(JSON.stringify({
          type: 'palette',
          content: p
        }))
        layer._addEffectToLayer(newPalette)
        isNeedCreateTree = true
      }
    })

    if (isNeedCreateTree) {
      this.trackTree?.createTree(this.rootNode)
    }
  }

  setCommonEffects(trackNode: ITrackNode, item: IMaterials) {
    if (!PAGRenderer.module) {
      return
    }

    const { commonEffectMap, layer } = trackNode
    const node = item.node
    const processMs = (node._currentTime - node._startTime) * 1000

    const itemCommonEffects = item?.commonEffects || []
    const commonEffects = Array.from(commonEffectMap?.values() ?? [])
    let isNeedCreateTree = false

    // 删除多余的特效
    if (commonEffects.length > itemCommonEffects.length) {
      const diff = commonEffects.length - itemCommonEffects.length
      for (let i = 0; i < diff; i++) {
        const effect = commonEffects.pop()
        layer._removeEffect(effect)
      }
      isNeedCreateTree = true
    }

    // 按照顺序去对应
    itemCommonEffects?.forEach((itemCommonEffect, i) => {
      let commonEffect = commonEffects?.[i]
      // 如果已经有commonEffect，则更新
      if (!commonEffect) {
        commonEffect = layer._MakeEffect(JSON.stringify({
          content: itemCommonEffect,
          type: 'commonEffect'
        })); // 顺序同协议的commonEffect顺序
        layer._addEffectToLayer(commonEffect)
        isNeedCreateTree = true
      } else {
        // 创建 Fragcodelist 
        const vectorArray = new PAGRenderer.module!.VectorString()
        itemCommonEffect.source.forEach((s) => vectorArray.push_back(s))
        // 创建 SamplingList
        const vectorInt = new PAGRenderer.module!.VectorFloat()
        itemCommonEffect.samplingList.forEach((s: any) => vectorInt.push_back(s))
        // 设置 uniformList
        itemCommonEffect.uniformList?.forEach((e, i) => Object.entries(e).forEach(([key, value]) => commonEffect._setUniformAtIndex(key, value, i)))

        commonEffect._updateFragcodeAndSamplingList(vectorArray, vectorInt)
        commonEffect._setVisible(true)
      }

      if (processMs < commonEffect.startTime) {
        commonEffect.progress = 0
      } else if (processMs > commonEffect.endTime) {
        commonEffect.progress = 0
      } else {
        const duration = itemCommonEffect.endTime - itemCommonEffect.startTime
        const time = processMs - itemCommonEffect.startTime
        const range = (itemCommonEffect.to ?? 1) - (itemCommonEffect.from ?? 0)
        commonEffect.progress = time / duration * range + (itemCommonEffect.from ?? 0)
      }
    })
    if (isNeedCreateTree) {
      this.trackTree?.createTree(this.rootNode)
    }
  }
  /**
   * 设置图层的参数配置
   * 1. 设置调色
   * 2. 设置动画
   * 3. 设置裁剪
   * 4. 设置缩放、平移、旋转
   * @param trackNode 
   * @param item 
   */
  configureImageLayer(trackNode: ITrackNode, item: IMaterials) {
    const { layer: imgLayer } = trackNode
    const node = item.node
    const imgStr = node?.pipParams

    if (imgStr.palette) {
      this.setImageLut(imgStr.palette, node)
    }

    if (imgStr.scaleMode && imgLayer?._getScaleMode() !== imgStr.scaleMode) {
      imgLayer?._setScaleMode(+imgStr.scaleMode)
    }
    // scaleMode:4 不使用裁剪参数
    if (+imgStr.scaleMode !== 4 && (node?.metaData as IVideoTrackItem)?.needCut) {
      imgLayer?._setCropParam(
        { x: imgStr.crop.x0, y: imgStr.crop.y0 },
        { x: imgStr.crop.x1, y: imgStr.crop.y1 }
      )
    }
    imgLayer?._setScale({
      x: imgStr.transform?.scale[0] ?? 1,
      y: imgStr.transform?.scale[1] ?? 1,
    })
    imgLayer?._setTranslate({
      x: imgStr.transform?.translate[0] ?? 0,
      y: imgStr.transform?.translate[1] ?? 0,
    })
    imgLayer?._setRotate(imgStr.transform?.rotate[0] ?? 0)
  }
  // 更新图层图片
  updateImageLayerData(trackNode: ITrackNode, item: IMaterials) {
    const { layer } = trackNode
    const dataPtr = this.mallocUint8Img(item.imageData?.data)
    layer?._updateLayerImage(dataPtr, item.imageData?.width, item.imageData?.height, 4)
    PAGRenderer.module?._free(dataPtr)
  }
  // 获取插入的位置
  getInsertIndex(trackNodeList: ITrackNode[], startTime: number, endTime: number): number {
    if (!trackNodeList.length) {
      return 0
    }
    const firstTrackNode = trackNodeList[0]
    const lastTrackNode = trackNodeList[trackNodeList.length - 1]

    // 添加到首位
    if (endTime <= firstTrackNode.trackItem.startTime) {
      return 0
    }
    // 添加到末尾
    if (startTime >= lastTrackNode.trackItem.endTime) {
      return trackNodeList.length
    }
    // 添加到中间
    const index = trackNodeList.findIndex((trackNode, i) => {
      const trackNodeEndTime = get(trackNode, 'trackItem.endTime');
      const nextTrackNodeStartTime = get(trackNodeList?.[i + 1], 'trackItem.startTime', Infinity);
      if (isNumber(trackNodeEndTime) && isNumber(nextTrackNodeStartTime)) {
        return startTime >= trackNodeEndTime && endTime <= nextTrackNodeStartTime
      }
    })
    return index + 1
  }
  // 新增layer
  addLayer(node: ISourceNode) {
    // 1. 获取轨道节点，如果没有则创建，并结束
    // 2. 如果有轨道节点，则在轨道节点下创建坑位节点
    //    1. 通过时间点信息，判断应该插入的位置
    //    2. 插入新节点
    console.log('addLayer')
    const trackGroupNode = this.trackTree?.findGroupNode(node.trackId)

    if (!trackGroupNode) {
      // 创建轨道节点
      const track = {
        trackType: get(node, 'type'),
        hide: false,
        trackId: get(node, 'trackId'),
        children: [get(node, 'metaData')],
      }
      const trackGroupNode = this.rootNode._MakeTrack(JSON.stringify(track))
      this.rootNode._addLayer(trackGroupNode)
    } else {
      // 创建坑位节点
      const newImageLayer = trackGroupNode?.layer?._MakeLayer(JSON.stringify(node.metaData))
      const startTime = get(node, 'metaData.startTime') as number
      const endTime = get(node, 'metaData.endTime') as number
      const index = this.getInsertIndex(trackGroupNode?.children || [], startTime, endTime)
      index >= 0 && trackGroupNode?.layer?._addLayerAt(newImageLayer, index)
    }
    this.trackTree?.createTree(this.rootNode)
  }
  // 获取trackNode，如果没有则创建
  getOrCreateTrackNode(node: ISourceNode) {
    let trackNode = this.trackTree?.findNode(node.id)
    if (!trackNode) {
      // 这里可以做新能优化：在操作了addNode之后，直接更新addLayer，不将新增节点的操作，放在这里
      // 但是这样做的好处是做了一个收敛
      this.addLayer(node)
    }
    trackNode = this.trackTree?.findNode(node.id)
    return trackNode
  }
  drawImageLayer(item: IMaterials) {
    const trackNode = this.getOrCreateTrackNode(item.node)
    const { node } = item;
    if (!trackNode) {
      return
    }

    this.setCommonEffects(trackNode, item)
    this.configureImageLayer(trackNode, item)
    this.updateImageLayerData(trackNode, item)
    if(node.metaData.hide) {
      return
    }
    trackNode?.layer?._setLayerVisible(true)
  }
  drawPagLayer(item: IMaterials) {
    // console.log('drawPagLayer')

    const trackNode = this.getOrCreateTrackNode(item.node)
    const { node } = item;
    if (!trackNode || node.metaData.hide) return

    const { layer: pagLayer } = trackNode
    const pagFileIns = item.pag!
    const pipParams = item.node.pipParams as IPipParams

    // 隐藏图层
    if (pipParams.hide) {
      pagLayer?._setLayerVisible(false)
      return
    }

    const materialId = `${pipParams.materialId}`
    // 更新pag文件
    try {
      pagLayer?._updatePAGFile(pagFileIns.wasmIns)
    } catch (e) {
      console.error('load pag 失败')
    }

    const textLy = pagFileIns.wasmIns._getLayersByEditableIndex(0, 3).get(0)
    // 设置文案内容 & 富文本
    if ((pipParams.texts as TextBasic[]).length > 1) {
      textUtil.pagRichText(textLy, pipParams as IFontParams)
    } else {
      textUtil.hideRich(materialId as string)
      textUtil.pagText(textLy, pipParams.texts?.[0] as IFontParams)
    }
    // 设置位置
    pipParams?.position && pagLayer?._setSubtitlePos({ x: pipParams.position[0], y: pipParams.position[1] })
    // 设置进度
    const processRate = utils.animationRate(item.currentTime!, item.node)
    pagLayer?._setProgress(processRate)

    // 设置缩放 & 位移
    if (!pipParams?.fixedBoundbox) {
      pagLayer?._setScale({
        x: pipParams.transform?.scale[0],
        y: pipParams.transform?.scale[1],
      })
      pagLayer?._setTranslate({
        x: pipParams.transform?.translate[0] ?? 0,
        y: pipParams.transform?.translate[1] ?? 0,
      })
    }
    pagLayer?._setLayerVisible(true)
  }

  hideAllNodeLayer() {
    this.trackTree?.traverseTree((trackNode: ITrackNode) => {
      const { layer } = trackNode
      layer?._setLayerVisible(false)
    })
  }

  hideOutOfRangeImageLayers(time: number) {
    this.trackTree?.traverseTree((trackNode: ITrackNode) => {
      const { layer, videoCtxNode, layerType } = trackNode
      if (layerType === LAYER_TYPE.image) {
        const startTime = videoCtxNode?._startTime!
        const endTime = videoCtxNode?._stopTime!
        if (isNumber(startTime) && isNumber(endTime) && startTime >= 0 && endTime >= 0) {
          if (time < startTime || time > endTime) {
            layer?._setLayerVisible(false)
          }
        }
      }
    })
  }

  hideNonMatchingSubtitles(node: INode) {
    this.trackTree?.traverseTree((trackNode: ITrackNode) => {
      const { id, layer, layerType } = trackNode
      if (layerType === LAYER_TYPE.pag) {
        if (node.id !== id) {
          layer?._setLayerVisible(false);
        }
      }
    })
  }
  // 移除图层
  removeLayer(node: ISourceNode) {
    const parentTrackNode = this.trackTree?.findGroupNode(node.trackId)
    const trackNode = this.trackTree?.findNode(node.id)
    parentTrackNode?.layer?._removeLayer(trackNode?.layer)
    this.trackTree?.createTree(this.rootNode)
  }

  drawReview(pagFileIns: IPagFile, defaultObj: any, params: IFontParams | null) {
    let pagLayer = this.rootNode._createPAGLayer(JSON.stringify(defaultObj))
    this.rootNode._addLayer(pagLayer)
    pagLayer._updatePAGFile(pagFileIns.wasmIns)
    if (params) {
      // 3 表示为TEXT 图层 因为之前的 PAGRenderer.module?.LayerType.Text 无法获取
      // TODO，提取为单独变量
      let textLy: ITextLy = pagFileIns.wasmIns._getLayersByEditableIndex(0, 3).get(0)
      textUtil.pagText(textLy, params)
    }
    params?.position && pagLayer._setSubtitlePos({ x: params?.position?.[0], y: params?.position?.[1] })
    // pagLayer._setProgress(0.1)
    pagLayer._setTranslate({ x: 0, y: 0 })
    pagLayer._setScale({
      x: 1,
      y: 1,
    })
  }

  addFont() {
  }
  addTransition(
    node: ISourceNode,
    transitionIn: Transition,
    transitionOut: Transition
  ) {
    const groupTrackNode = this.trackTree?.findGroupNode(node.trackId)
    const newEffectTransition = groupTrackNode?.layer?._MakeTransition(JSON.stringify(transitionIn), JSON.stringify(transitionOut))
    groupTrackNode?.layer?._addTransition(newEffectTransition)
    this.trackTree?.createTree(this.rootNode)
    return newEffectTransition
  }
  getOrCreateTransition(node: ISourceNode, transitionIn: Transition, transitionOut: Transition) {
    const transitionId = transitionIn.effectId;
    let effectTransition = this.trackTree?.findEffectTransition(transitionId)
    if (!effectTransition) {
      return this.addTransition(node, transitionIn, transitionOut)
    }
    return effectTransition;
  }
  drawTransition(
    node: ISourceNode,
    transition: Transition, // transitionIn 和 transitionOut 内容一样
    transitionOut: Transition,
    progress: number
  ) {
    if (transition) {
      this.hideAllTransition()
      const effectTransition = this.getOrCreateTransition(node, transition, transitionOut);
      if (progress >= 1) {
        effectTransition._setTransitionVisible(false)
      } else {
        // 这里需要备注说明，不然后人肯定看不懂
        // 由于转场的实现[0,0.5)会取上一个layer的内容，(0.5,1]会取下一个layer的内容。但是当0.5的时候就无法取到了。正常播放的情况下，由于会跳帧，一般很难跳到0.5的位置。
        // 故当我们遇到0.5时，手动的将progress设置为0.5001，这样就可以取到下一个layer的内容了
        if(progress === 0.5) {
          progress = 0.5 + 0.0001
        }
        effectTransition._setTransitionVisible(true)

        effectTransition._setProgress(progress)
      }
    }
  }
  hideTransition(transition: Transition) {
    const effectTransition = this.trackTree?.findEffectTransition(transition?.effectId!)
    if (effectTransition) {
      effectTransition._setProgress(1)
      effectTransition._setTransitionVisible(false)
      this.displayLayer(transition.layerList?.[0], false)
    }
  }
  hideAllTransition() {
    this.trackTree?.groupBucket.forEach((node) => {
      const transitionMap = node.transitionMap
      if(transitionMap?.size) {
        for(const [key, effectTransition] of transitionMap) {
          effectTransition._setProgress(1)
          effectTransition._setTransitionVisible(false)
        }
      }
    
      // transitionMap._setProgress(1)
      // transitionMap._setTransitionVisible(false)
      // layer?._setTransitionVisible(false)
    })
    // for (const node of this.trackTree.groupBucket.values()) {

    // }

  }
  removeTransition(transitionId: string) {
    const effectTransition = this.trackTree?.findEffectTransition(transitionId);
    const groupTrackNode = this.trackTree?.findGroupNodeByTransitionId(transitionId)
    groupTrackNode?.layer?._removeTransition(effectTransition)
    this.trackTree?.createTree(this.rootNode)
  }

  removeAllLayer() {
    const num = this.rootNode?._numberChildren()
    for (let i = 0; i < num; i += 1) {
      this.rootNode._removeLayerAt(0)
    }
  }
  renderDestroy() {
    console.log('renderDestroy')
    textUtil.removeText()
    this.removeAllLayer()
    this.rootNode?._draw()
  }
  draw() {
    requestAnimationFrame(() => {
      this.rootNode._draw()
    })
    
  }
  // 单独对pag截图的
  async drawFrame() {
    await PAGRenderer.module?.webAssemblyQueue.exec(this.rootNode._draw, this.rootNode)
  }

  readPixels() {
    if (!this.rootNode) return null
    const { x: width, y: height } = this.rootNode._getScreenSize()
    const len = width * height * 4
    const dataPtr = PAGRenderer.module?._malloc(len)
    const res = this.rootNode._readPixels(dataPtr)
    if (res) {
      const data = PAGRenderer.module?.HEAPU8.subarray(
        dataPtr,
        dataPtr + len
      )
      PAGRenderer.module?._free(dataPtr)
      return data
    }
    return null
  }

  /**
   * 更新坑位/轨道的协议内容
   * @param id 坑位或者轨道的id
   * @param content 协议内容
   * @param isGroup 是否是轨道
   */
  updateCmp2Content(id: string, content: Record<string, any>, isGroup: boolean = false) {
    const node = isGroup ? this.trackTree?.findGroupNode(id) : this.trackTree?.findNode(id)
    const layer = node?.layer
    if (layer) {
      const oldContentStr = layer._getCmp2Content()
      const oldContent = JSON.parse(oldContentStr);
      const newContent = Object.assign(oldContent, content)
      layer._updateCmp2Content(JSON.stringify(newContent))
    }
  }

  updateCmp2Transition(type: string, transition: Transition) {
    const current = this.trackTree?.findEffectTransition(transition.effectId)
    if(type === 'in') {
      current?._updateCmp2InContent(JSON.stringify(transition))
    } 
    if(type === 'out'){
      current?._updateCmp2OutContent(JSON.stringify(transition))
    }
  }

  dumpCmp2Content(): string {
    return this.rootNode?._dumpCmp2()
  }


  // ------ clean up ------
  private clearTimer() {
    if (this.timer) {
      window.cancelAnimationFrame(this.timer)
      this.timer = null
    }
  }
  clear() {
    super.clear()
    // todo: C++给个方法?
    const gl = this.view.getContext('webgl2') as WebGLRenderingContext
    gl?.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl?.clearColor(0.0, 0.0, 0.0, 0.0)
    gl?.clear(gl.COLOR_BUFFER_BIT)
    this.clearTimer()
  }

  destroy() {
    this.clear()
    super.destroy()
  }
}

