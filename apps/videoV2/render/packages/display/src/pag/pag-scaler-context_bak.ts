import { createOfflineCanvas, measureText } from '@van-gogh/video-render-core'
import { defaultFontName } from '../font/config'

export interface Bounds {
  top: number | undefined
  left: number | undefined
  bottom: number | undefined
  right: number | undefined
}

// TODO: 这个文件干啥的

export class ScalerContext {
  // @ts-ignore
  static canvas: HTMLCanvasElement | OffscreenCanvas = createOfflineCanvas(10, 10)

  static context: any = ScalerContext.canvas.getContext('2d')

  static isEmoji(text: string): boolean {
    let testCanvas = document.createElement('canvas')
    let testContext = testCanvas.getContext('2d')

    testCanvas.width = 1
    testCanvas.height = 1
    testContext!.textBaseline = 'top'
    testContext!.font = '100px -no-font-family-here-'

    testContext!.scale(0.01, 0.01)
    testContext!.fillStyle = '#000'
    testContext!.globalCompositeOperation = 'copy'

    testContext!.fillText(text, 0, 0)

    const color = testContext!.getImageData(0, 0, 1, 1).data.toString()
    // @ts-ignore
    testCanvas = null
    testContext = null
    return !color.includes('0,0,0,')
  }

  private readonly fontName: string
  private readonly size: number
  private readonly fauxBold: boolean
  private readonly fauxItalic: boolean

  private fontBoundingBoxMap: { key: string; value: Bounds }[] = []

  constructor(fontName: string, size: number, fauxBold = false, fauxItalic = false) {
    this.size = size
    this.fontName = '"' + fontName + '"'
    this.fauxBold = fauxBold
    this.fauxItalic = fauxItalic
  }

  fontString() {
    const fallbackFontNames = defaultFontName.concat()
    fallbackFontNames.unshift(this.fontName)

    const attributes: Array<string> = []
    if (this.fauxBold) {
      attributes.push('bold')
    }
    if (this.fauxItalic) {
      attributes.push('italic')
    }
    attributes.push(`${this.size}px`)
    attributes.push(`${fallbackFontNames.join(',')}`)

    return attributes.join(' ')
  }

  getTextAdvance(text: string) {
    const { context } = ScalerContext
    context.font = this.fontString()
    return context.measureText(text).width
  }

  getTextBounds(text: string) {
    const { context } = ScalerContext
    context.font = this.fontString()
    const metrics = this.measureText(context, text)

    const bounds: Bounds = {
      left: Math.floor(-metrics.actualBoundingBoxLeft),
      top: Math.floor(-metrics.actualBoundingBoxAscent),
      right: Math.ceil(metrics.actualBoundingBoxRight),
      bottom: Math.ceil(metrics.actualBoundingBoxDescent),
    }
    return bounds
  }

  generateFontMetrics() {
    const { context } = ScalerContext
    context.font = this.fontString()

    const metrics = this.measureText(context, '中')
    const capHeight = metrics.actualBoundingBoxAscent

    const xMetrics = this.measureText(context, 'x')
    const xHeight = xMetrics.actualBoundingBoxAscent

    return {
      ascent: -metrics.fontBoundingBoxAscent,
      descent: metrics.fontBoundingBoxDescent,
      xHeight,
      capHeight,
    }
  }

  private measureText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, text: string) {
    const metrics = ctx.measureText(text)

    if (metrics?.actualBoundingBoxAscent) return metrics

    ctx.canvas.width = this.size * 1.5
    ctx.canvas.height = this.size * 1.5

    const pos = [0, this.size]
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.font = this.fontString()
    ctx.fillText(text, pos[0], pos[1])

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const { left, top, right, bottom } = measureText(imageData)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let fontMeasure: Bounds
    const fontBoundingBox = this.fontBoundingBoxMap.find((item) => item.key === this.fontName)
    if (fontBoundingBox) {
      fontMeasure = fontBoundingBox.value
    } else {
      ctx.font = this.fontString()
      ctx.fillText('测', pos[0], pos[1])

      const fontImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      fontMeasure = measureText(fontImageData)

      this.fontBoundingBoxMap.push({ key: this.fontName, value: fontMeasure })

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    return {
      actualBoundingBoxAscent: pos[1] - Number(top),
      actualBoundingBoxRight: Number(right) - pos[0],
      actualBoundingBoxDescent: Number(bottom) - pos[1],
      actualBoundingBoxLeft: pos[0] - Number(left),
      fontBoundingBoxAscent: (fontMeasure.bottom ?? 0 ) - (fontMeasure.top ?? 0),
      fontBoundingBoxDescent: 0,
    }
  }
}
