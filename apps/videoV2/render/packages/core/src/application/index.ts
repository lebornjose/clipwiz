/**
 * initialize an app
 */
import {
  PagContainer,
  createContainer,
} from '@van-gogh/video-render-display-v2'
import { PAGInit } from '@van-gogh/video-render-paglib-v2' 
import { PAGRenderer, createRenderer } from '../renderer/index'
import { FramingPAGRenderer, framingCreateRenderer } from '../renderer/framing'
import { IFont, fetchFontConfig, formatFontName } from '../font'
import commandFunc from '../../../common/index'

export interface IApplication{
  stage: PagContainer | undefined | null
  renderer: PAGRenderer
  PAG: any
  destroy(): void
  clear(): void
  fontList: IFont[]
  addFont: (val: {FontFamily: string, FontType: string}) => Promise<void>
}
export interface FramingRender {
  model: any
  stage: PagContainer | undefined | null
  renderer: FramingPAGRenderer
  fontList: IFont[]
  addFont: (val: {FontFamily: string, FontType: string}) => Promise<void>
  destroy(): void
  clear(): void
}

export class Application {
  model: any
  stage: PagContainer | undefined | null
  fontList: IFont[] | undefined
  renderer: PAGRenderer | FramingPAGRenderer | undefined | null
  loader: any
  PAG: any
  /**
   * @param options
   * @param {number} [options.width=320] - canvas width
   * @param {number} [options.height=280] - canvas height
   * @param {HTMLCanvasElement} [options.view] - the canvas element
   * @param {boolean} [options.pagEnabled=false] - 是否使用 PAG 渲染
   * @param {boolean} [options.useAudio=false] - 是否使用 webAudio
   * @param {boolean} [options.useFrames=false] - 是否渲染序列帧
   * @param {boolean} [options.useFont=false] - 是否加载自定义字体，在 render 里判断并触发加载
   * @param {string} [options.wasmUrl] -
   * @param {number} [options.resolution] -
   * @param {type} [options.type = 0] // 0 编辑, 1. 截图
   */
  constructor(options: GlobalMixins.IApplicationOptions) {
      this.fontList = []
      if (!options.resolution) {
          options.resolution = window.devicePixelRatio || 1
      }
      this.stage = createContainer(options)
      this.renderer = options.type ? framingCreateRenderer(options) : createRenderer(options)
  }

  async getFontList(fontConfigUrl: string) {
    const data = await fetchFontConfig(fontConfigUrl)
    if (data.ossFonts) {
      this.fontList = data.ossFonts as  IFont[]
    }
  }



  async addFont(val: {FontFamily: string, FontType: string}) {
    const { FontFamily, FontType } = val
    const currentFontName = formatFontName(FontFamily, FontType)
    const font = this.fontList?.find(item => {
      const fontName = formatFontName(item.FontFamily, item.FontType)
      return currentFontName === fontName
    })
    if(font?.url) {
      const file = await fetch(font.url).then((res) => res.blob())
      const fontName = commandFunc.getFontName(FontFamily + FontType)
      await this.model.PAGFont.registerFont(fontName, file);
    }
  }

  static async create(options: GlobalMixins.IApplicationOptions) {
    let PAG = await PAGInit()
    const app = new Application(options)
    if(options?.fontConfigUrl) {
      await app.getFontList(options.fontConfigUrl)
    }
    app.model = PAG
    app.stage?.bindModules(PAG)
    app.renderer?.bindModules(PAG)
    if(options?.fontConfigUrl) {
      app.getFontList(options.fontConfigUrl)
    }
    return app
  }


  getFontUrl(FontFamily: string, FontType: string) {
    const font = this.fontList?.find((item) => item.FontFamily === FontFamily && item.FontType === FontType)
    return font?.url
  }

  // ------ clean up ------
  destroy() {
      this.renderer?.destroy()
      this.renderer = null
      this.stage?.destroy()
      this.stage = null
  }

  clear() {
      this.renderer?.clear()
      this.stage?.clear()
  }
}
