import { getFontString } from '@van-gogh/video-render-core'
import { defaultFontName } from '../font/config'

type IText = {
  get: (key: number) => string
  size(): number
}

type IPoint = {
  x: number
  y: number
}

enum Join {
  Miter,
  Round,
  Bevel,
}
enum Cap {
  Butt,
  Round,
  Square,
}

type IStroke = {
  cap: Cap
  join: Join
  width: number
  miterLimit: number
}

enum IPathFillType {
  Winding,
  EvenOdd,
  InverseWinding,
  InverseEvenOdd,
}

type ITextPosition = {
  get: (key: number) => IPoint
  size(): number
}

type IMatrix = {
  a: number // scaleX
  b: number // skewY
  c: number // skewX
  d: number // scaleY
  tx: number // translateX
  ty: number // translateY
}

export class WebMask {
  static module: any

  private static getLineCap(cap: number): CanvasLineCap {
    switch (cap) {
      case 1:
        return 'round'
      case 2:
        return 'square'
      default:
        return 'butt'
    }
  }

  private static getLineJoin(join: number): CanvasLineJoin {
    switch (join) {
      case 1:
        return 'round'
      case 2:
        return 'bevel'
      default:
        return 'miter'
    }
  }

  private readonly canvas: HTMLCanvasElement

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
  }

  fillPath(path: Path2D, fillType: IPathFillType) {
    const context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    if (
      fillType === WebMask.module.PathFillType.INVERSE_WINDING ||
      fillType === WebMask.module.PathFillType.INVERSE_EVEN_ODD
    ) {
      context.clip(path, fillType === WebMask.module.PathFillType.INVERSE_EVEN_ODD ? 'evenodd' : 'nonzero')
      context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    } else {
      context.fill(path, fillType === WebMask.module.PathFillType.EVEN_ODD ? 'evenodd' : 'nonzero')
    }
  }

  fillText(
    size: number,
    fauxBold: boolean,
    fauxItalic: boolean,
    fontFamily: string,
    texts: IText,
    positions: ITextPosition,
    matrix: IMatrix
  ) {
    const context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty)

    context.font = getFontString(size, fauxBold, fauxItalic, fontFamily, defaultFontName)

    for (let i = 0; i < texts.size(); i++) {
      const position: IPoint = positions.get(i)
      context.fillText(texts.get(i), position.x, position.y)
    }
  }

  strokeText(
    size: number,
    fauxBold: boolean,
    fauxItalic: boolean,
    fontFamily: string,
    stroke: IStroke,
    texts: IText,
    positions: ITextPosition,
    matrix: IMatrix
  ) {
    if (stroke.width < 0.5) {
      return
    }

    const context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty)

    context.font = getFontString(size, fauxBold, fauxItalic, fontFamily, defaultFontName)

    context.lineJoin = WebMask.getLineJoin(stroke.join)
    context.lineCap = WebMask.getLineCap(stroke.cap)
    context.miterLimit = stroke.miterLimit
    context.lineWidth = stroke.width

    for (let i = 0; i < texts.size(); i++) {
      const position: IPoint = positions.get(i)
      context.strokeText(texts.get(i), position.x, position.y)
    }
  }

  update(GL: any) {
    const gl = GL.currentContext.GLctx as WebGLRenderingContext
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, this.canvas)
  }
}
