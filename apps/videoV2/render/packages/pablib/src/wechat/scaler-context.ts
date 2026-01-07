import { getCanvas2D } from '../tgfx/src/wechat/canvas'
import { ScalerContext as NativeScaleContext } from '../tgfx/src/core/scaler-context'

import type { Rect } from '../types'

export class ScalerContext extends NativeScaleContext {
  public generateImage(text: string, bounds: Rect) {
    const canvas = getCanvas2D(bounds.right - bounds.left, bounds.bottom - bounds.top)
    const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
    context.font = this.fontString()
    context.fillText(text, -bounds.left, -bounds.top)
    return canvas
  }

  protected override loadCanvas() {
    if (!ScalerContext.canvas) {
      ScalerContext.setCanvas(getCanvas2D(10, 10))
      ScalerContext.setContext(
        (ScalerContext.canvas as HTMLCanvasElement | OffscreenCanvas).getContext(
          '2d',
        ) as OffscreenCanvasRenderingContext2D,
      )
    }
  }
}
