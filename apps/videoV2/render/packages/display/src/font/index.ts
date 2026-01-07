import type { IOSSFont, IFontConfig, IDefaultFont } from './config'
import { registerFont, formatFontName } from '@van-gogh/video-render-core-v2'
import { fontConfig as defaultFontConfig, defaultFontName } from './config'
import { oss2cdn } from '@van-gogh/utils/biz'

type IFontDict = {
  [key: string]: string
}
export interface IFontManager{
  ossFonts: IFontDict
  defaultFont: string[]
  fontCache: {
    [key: string]: Object
  }
  waitingQueue: Array<any>
  loading: boolean
  registerDefaultFont: (module: GlobalMixins.IModule, config?: IFontConfig) => void
  addFond2Load: (font: IOSSFont) => Promise<any>
  load: () => void
  destroy: () => void
  isRunning: () => boolean
}

export class FontManager implements IFontManager {
  // 第三方字体
  ossFonts: IFontDict = {}
  // 默认字体
  defaultFont: string[] = []
  // 已经加载的字体，避免重复加载
  fontCache = {}
  // 等待加载的字体
  waitingQueue: any = []
  loading = false
  constructor() { }

  registerDefaultFont(module: GlobalMixins.IModule, config?: IFontConfig) {
      // @ts-ignore
    ; (config?.ossFonts || defaultFontConfig.ossFonts || []).forEach((font: IOSSFont) => this.add2OSSFont(font))

    this.defaultFont = config?.fallbackFont?.map((c: IDefaultFont) => c.name) || defaultFontName

    // call wasm to register the default font
    const names = this.defaultFont.reduce((memo, n) => {
      memo.push_back(n)
      return memo
    }, new module.VectorString())

    if (names && names.size()) {
      module._PAGFont._SetFallbackFontNames(names)
      names.delete()
    }
  }

  async addFond2Load(font: IOSSFont) {
    if (!font) return
    // no need to load it
    if (this.hasFontInDefault(font)) return console.log('font has already in the default font list')
    // we've already load it
    if (this.hasFontInCache(font)) return
    // url is required
    let url = font.url
    if (!url) {
      url = this.findFontUrl(font)
    }
    if (!url) return console.error('font url is required')
    // font id is required
    const fontWithStyle = this.getFontWithStyle(font)
    if (!fontWithStyle) return console.error('font key is required')
    font.url = url
    await this._loadFont(font)
    return this
  }

  async load() {
    if (this.isRunning()) return

    this.loading = true
    await Promise.all(this.waitingQueue.map(async (o: IOSSFont) => this._loadFont(o)))

    this.waitingQueue = []
    this.loading = false
  }


  private async _loadFont(font: IOSSFont) {
    const fontWithStyle = this.getFontWithStyle(font) || ''
     // @ts-ignore
    this.fontCache[fontWithStyle] = {
      font,
      status: 'loading',
    }
    const ok = await registerFont(fontWithStyle, font.url)
     // @ts-ignore
    this.fontCache[fontWithStyle]['status'] = 'loaded'

    if (!ok) {
      this.removeFromFontCache(font)
      throw new Error('fetch font failed')
    }
    // 不在我们的字体库里，就加入
    this.add2OSSFont(font)
  }

  // 是否依然有字体在加载
  isRunning() {
    // @ts-ignore
    return Object.keys(this.fontCache).some((o: string) => this.fontCache[o]['status'] == 'loading')
  }

  // 找到 三方字体 的 url
  private findFontUrl(font: IOSSFont) {
    const fontWithStyle = this.getFontWithStyle(font) || ''
    return this.ossFonts[fontWithStyle] || ''
  }

  private removeFromFontCache(font: IOSSFont) {
    const fontWithStyle = this.getFontWithStyle(font) || ''

    try {
      // @ts-ignore
      delete this.fontCache[fontWithStyle]
    } catch (e) { }
  }

  // 添加到三方列表
  private add2OSSFont(font: IOSSFont) {
    const fontWithStyle = this.getFontWithStyle(font)

    if (fontWithStyle) {
      if (!this.hasFontInList(font)) {
        // 业务需求，将所有 OSS 地址替换成 CDN
        this.ossFonts[fontWithStyle] = oss2cdn(font.url) 
      }
    }
  }

  // ---- ----
  // 检查是否在缓存里
  private hasFontInCache(font: IOSSFont) {
    const fontStyle = this.getFontWithStyle(font)
    // @ts-ignore
    return fontStyle && this.fontCache[fontStyle]
  }

  // 是否属于默认字体
  private hasFontInDefault(font: IOSSFont) {
    if (!font || !font.FontFamily) {
      return
    }
    return this.defaultFont.includes(font.FontFamily)
  }

  // 检查是否在缓存里
  private hasFontInList(font: IOSSFont) {
    const fontStyle = this.getFontWithStyle(font)
    return fontStyle && Object.keys(this.ossFonts).includes(fontStyle)
  }

  private getFontWithStyle(font: IOSSFont) {
    if (!font) {
      return
    }

    // 兼容线上OSS数据结构
    const {FontFamily = '', FontType = '' } = font
    return formatFontName((FontFamily || '') + (FontType || ''))
  }

  destroy() { }
}
