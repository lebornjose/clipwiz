import { IFontParams, INode, IPipParams, ITrackItem, IVideoCtx, IVideoTrackItem, RENDERER_TYPE, TextBasic } from '@van-gogh/video-render-constants'
import { PAGFile } from '@van-gogh/video-render-display-v2'
import { BaseRenderer } from './baseRenderer'
import textUtil from './text'

export interface IPagRendererOptions extends GlobalMixins.IBaseRenderOptions {
  repeatCount?: number
}

export class FramingPAGRenderer extends BaseRenderer {
  static module: any
  app: any
  private originalView: any
  // 根路径
  private rootNode: any = null
  private isBackgroundVideo = false // 是否有背景视频
  static videoCtx: IVideoCtx
  
  constructor(options: IPagRendererOptions) {
    // 需要绘制序列帧，则先使用 不在文档流的 canvas 渲染
    // 绘制完成，在替换到 DOM 中
    super(RENDERER_TYPE.PAG, options)
  }

  bindModules(module: any) {
    module.PAGView = FramingPAGRenderer
    FramingPAGRenderer.module = module
  }

  bindVideoCtx(videoCtx: IVideoCtx) {
    FramingPAGRenderer.videoCtx = videoCtx
  }

  mallocUint8Img(data: any) {
    const dataPtr = FramingPAGRenderer.module._malloc(data.length)
    const dataOnHeap = new Uint8Array(
      FramingPAGRenderer.module.HEAPU8.buffer,
      dataPtr,
      data.length
    )
    dataOnHeap.set(data)
    return dataPtr
  }
  // 实例化画布
  renderInit(width?: number, height?: number) {
    const jsonStr = [
      {
        boundBox: [0, 0, width, height],
        child: [],
        height: height,
        id: -1,
        name: 'Root',
        path: '',
        type: 'psdimage',
        width: width,
      },
    ]
    // this.resize(width || this.screen.width, height || this.screen.height)
    const pNode = this.originalView?.parentNode
    pNode?.replaceChild(this.view, this.originalView!)
    this.originalView = this.view

    const ctx = this.view.getContext('webgl2')
    const contextId = FramingPAGRenderer.module.GL.registerContext(ctx, {
      majorVersion: 2,
      minorVersion: 0,
    })
    FramingPAGRenderer.module.GL.makeContextCurrent(contextId)
    const sur = FramingPAGRenderer.module._PAGSurface._FromRenderTarget(
      0,
      width,
      height,
      true
    )
    this.rootNode = FramingPAGRenderer.module._BannerRootNode._createRoot(
      JSON.stringify(jsonStr),
      sur
    ) // 添加根元素
    this.rootNode._setCleanColor({ r: 0, g: 0, b: 0, a: 1 })
  }
  
  // 画图像
  drawImage(pipParams: IPipParams, imageData: ImageData, item: IVideoTrackItem, helpFn?: any) {
    let imgLayer = this.rootNode._createImageLayer(JSON.stringify(pipParams))
    // scaleMode:4 不使用裁剪参数
    if (+pipParams.scaleMode !== 4 ) {
      imgLayer._setCropParam(
        { x: pipParams.crop.x0, y: pipParams.crop.y0 },
        { x: pipParams.crop.x1, y: pipParams.crop.y1 }
      )
    }
    if(item?.useType === 'background' || item.useType === 'background') {
      this.rootNode._addLayerAt(imgLayer, 0)
      this.isBackgroundVideo = true
    } else {
      if(this.isBackgroundVideo) {
        this.rootNode._addLayer(imgLayer)
      } else {
        // 如果是数字人，则在视频上层
        if(item?.url?.includes('webm') || item?.webExtend?.isDigitalHuman) {
          this.rootNode._addLayer(imgLayer)
        } else {
          this.rootNode._addLayerAt(imgLayer, 0)
        }
      }
    }
    // if(item?.url?.includes('webm')) {
    //   this.rootNode._addLayer(imgLayer)
    // } else {
    //   this.rootNode._addLayerAt(imgLayer, 0)
    // }
    const dataPtr = this.mallocUint8Img(imageData?.data)
    imgLayer._updateLayerImage(dataPtr, pipParams.width, pipParams.height, 4)
    FramingPAGRenderer.module._free(dataPtr)
    const { palette }  = pipParams 
    if (palette) {
      // wasm 那边非要加个effType，前端没有任何用途
      /* eslint-disable */
      palette.effType = 'palette'
      imgLayer._addEffectByJson(JSON.stringify(palette))
    }
    imgLayer._setScale({
      x: pipParams?.transform?.scale[0] ?? 1,
      y: pipParams?.transform?.scale[1] ?? 1,
    })
    imgLayer._setTranslate({
      x: pipParams?.transform?.translate[0] ?? 0,
      y: pipParams?.transform?.translate[1] ?? 0,
    }) 
  }

  colorReplace(arr: Array<number>) {
    return {
      red: arr[0],
      green: arr[1],
      blue: arr[2],
    }
  }

  // addFont() {
  //   debugger
  //   // pag 有个bug 如果文字已经被写了，不做任何变更，会导致字体不生效
  //   for (let key in this.textLyArray) {
  //     if (key) {
  //       const textLy = this.textLyArray[key]
  //       textUtil.pagText(textLy, {
  //         text: ''
  //       } as IFontParams)
  //     }
  //   }
  // }

  // 富文本
  // fontFamily?: string
  // leading?: number
  // fillColor?: Color
  // tracking?: number
  // fauxBold?: boolean,
  // fauxItalic?: boolean
  // strokeColor?: Color
  // strokeWidth?: number
  // shadowColor?: Color
  // shadowOpacity?: number
  // shadowDistance?: number
  // shadowAngle?: number
  pagRichText(textLy: any, pipParams: any) {
    let obj = textLy._createRichTextBySize(pipParams.texts.length, pipParams.transition);
    for (let i = 0; i < pipParams.texts.length; i++) {
      let item = pipParams.texts[i]
      let doc = obj._createDocumentByCopyAtIndex(i)
      doc.text = item.text
      item.color && (doc.fillColor = this.colorReplace(item.color))
      pipParams.fontFamily && (doc.fontFamily = pipParams.fontFamily)
      item.fontStyle && (doc.fontStyle = item.fontStyle)
      item.tracking && (doc.tracking = item.tracking)
      item.leading && (doc.leading = item.leading)
      item.fauxBold && (doc.fauxBold = item.fauxBold)
      item.fauxItalic && (doc.fauxItalic = item.fauxItalic)
      item.strokeColor && (doc.strokeColor = this.colorReplace(item.strokeColor))
      item.shadowColor && (doc.shadowColor = this.colorReplace(item.shadowColor))
      item.shadowOpacity && (doc.shadowOpacity = item.shadowOpacity)
      item.shadowDistance && (doc.shadowDistance = item.shadowDistance)
      item.shadowAngle && (doc.shadowAngle = item.shadowAngle)
      obj._replaceTextDocAtIndex(doc, i);
    }
  }


  drawPag(pagFileIns: PAGFile, pipParams: any, processTime: number) {

    let pagLayer: any = null
    let textLy = null

    pagLayer = this.rootNode._createPAGLayer(JSON.stringify(pipParams))
    this.rootNode._addLayer(pagLayer)
    // 3 表示为TEXT 图层 因为之前的 PAGRenderer.module?.LayerType.Text 无法获取
    // TODO，提取为单独变量
    textLy = pagFileIns.wasmIns._getLayersByEditableIndex(0, 3).get(0)
    try {
      pagLayer._updatePAGFile(pagFileIns.wasmIns)
    } catch (e) {
      console.error('load pag 失败')
    }
    if (pipParams.texts.length > 1) {
      this.pagRichText(textLy, pipParams)
    } else {
      textLy._setText(pipParams.text)
      pipParams.color && textLy._setFillColor({
        red: pipParams.color[0],
        green: pipParams.color[1],
        blue: pipParams.color[2],
      })
      const textDoc: any = textLy._createDocumentByCopy()
      if (pipParams.fontFamily) {
        textDoc.fontFamily = pipParams.fontFamily
      }
      if (pipParams.fontStyle) {
        textDoc.fontStyle = pipParams.fontStyle
      }
      textLy._replaceTextInternal(textDoc)
    }
    if ((pipParams.texts as TextBasic[]).length > 1) {
      textUtil.pagRichText(textLy, pipParams as IFontParams)
    } else {
      textUtil.hideRich(pipParams.materialId as string)
      textUtil.pagText(textLy, pipParams.texts?.[0] as IFontParams)
    }
    pipParams?.position && pagLayer._setSubtitlePos({ x: pipParams.position?.[0], y: pipParams.position?.[1] })
    pagLayer._setProgress(processTime)
    pagLayer._setScale({
      x: pipParams.transform.scale[0],
      y: pipParams.transform.scale[1],
    })
  }


  removeAllLayer() {
    if(!this.rootNode) {
      return
    }
    const num = this.rootNode?._numberChildren()
    for (let i = 0; i < num; i += 1) {
      this.rootNode._removeLayerAt(0)
    }
  }

  renderDestroy() { }

  hideAllTransition() { }


  async draw() {
    this.rootNode._draw()
  }

  async drawFrame() { }

  readPixels() {
    if (!this.rootNode) return null
    const { x: width, y: height } = this.rootNode._getScreenSize()
    const len = width * height * 4
    const dataPtr = FramingPAGRenderer.module._malloc(len)
    const res = this.rootNode._readPixels(dataPtr)
    if (res) {
      const data = FramingPAGRenderer.module.HEAPU8.subarray(
        dataPtr,
        dataPtr + len
      )
      FramingPAGRenderer.module._free(dataPtr)
      return data
    }
    return null
  }
  clear() {
    super.clear()
    // todo: C++给个方法?
    const gl = this.view.getContext('webgl2') as WebGLRenderingContext
    gl?.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl?.clearColor(0.0, 0.0, 0.0, 0.0)
    gl?.clear(gl.COLOR_BUFFER_BIT)
  }

  destroy() {
    this.removeAllLayer();
    this.clear()
    super.destroy()
  }
}
