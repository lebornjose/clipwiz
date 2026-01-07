import { readFile } from '../utils/util'

// 返回 CSS Font 的 DOM String
// https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/font
// font-style, font-variant, font-weight, font-size, line-height, font-family

export interface IFont{
  url: string
  FontFamily: string
  FontType: string
}


export function getFontString(
  size: number,
  fauxBold: boolean,
  fauxItalic: boolean,
  fontFamily: string,
  defaultFontName: string[]
) {
  const attributes: Array<string> = []

  if (fauxItalic) {
    attributes.push('italic')
  }

  if (fauxBold) {
    attributes.push('bold')
  }

  attributes.push(`${size}px`)

  attributes.push(`${['"' + fontFamily + '"'].concat(defaultFontName).join(',')}`)

  return attributes.join(' ')
}

// 注册任意第三方字体
export async function registerFont(fontName: string, data: string | File) {
  const source = await new Promise<string | Uint8Array | void>(async (resolve) => {
    if (typeof data == 'string') {
      return resolve(`url(${data})`)
    }

    const buffer = (await readFile(data)) as ArrayBuffer
    if (!buffer || !(buffer.byteLength > 0)) {
      return resolve()
    }

    resolve(new Uint8Array(buffer))
  })

  if (!source) return console.error('font empty')

  const font = new FontFace(fontName, source)
  try {
    const res = await font.load()
    // @ts-ignore
    document.fonts?.add(res)
    // console.log(fontName, 'has been loaded')
    return font
  } catch (e) {
    return console.error('font load error')
  }
}

// 拉取字体配置
// https://mogic-fonts.oss-cn-hangzhou.aliyuncs.com/fonts.json
export function fetchFontConfig(url: string): Promise<{
  fallbackFont: {
    name: string
  }[]
  ossFonts: IFont[]
}> {
  return fetch(url)
    .then((res) => res.json())
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.error(err)
      return
    })
}

export function formatFontName(FontFamily: string, FontType: string) {
  return ((FontFamily || '') + (FontType || '')).toLowerCase().replace(/\s/g, '')
}

