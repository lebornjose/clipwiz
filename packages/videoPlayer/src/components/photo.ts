import { Editor } from '../index'
import { IPhotoTrackItem, MATERIAL_TYPE, IPhotoNode } from '@clipwiz/shared'
import { TIME_CONFIG } from '@clipwiz/shared'

const drawContain = (
  ctx: CanvasRenderingContext2D,
  dstW: number,
  dstH: number,
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
) => {
  const safeSrcW = Math.max(1, srcW)
  const safeSrcH = Math.max(1, srcH)
  const scale = Math.min(dstW / safeSrcW, dstH / safeSrcH)
  const drawW = Math.max(1, Math.round(safeSrcW * scale))
  const drawH = Math.max(1, Math.round(safeSrcH * scale))
  const x = Math.round((dstW - drawW) / 2)
  const y = Math.round((dstH - drawH) / 2)
  ctx.clearRect(0, 0, dstW, dstH)
  ctx.drawImage(source, x, y, drawW, drawH)
}

export const addPhotoNode = (editor: Editor, trackId: string, item: IPhotoTrackItem) => {
  console.log(editor, trackId, item)
  let photoNode: IPhotoNode
  const canvas = document.createElement('canvas')
  canvas.width = editor.canvasWidth
  canvas.height = editor.canvasHeight
  canvas.style.width = `${editor.canvasWidth}px`
  canvas.style.height = `${editor.canvasHeight}px`
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  photoNode = editor.videoCtx.canvas(canvas)
  photoNode.ctx = ctx
  photoNode.url = item.url!
  ;(photoNode as any)._photoCanvas = canvas

  if (item.format !== MATERIAL_TYPE.GIF) {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (!ctx) return
      drawContain(ctx, editor.canvasWidth, editor.canvasHeight, image, image.naturalWidth, image.naturalHeight)
      editor.draw()
    }
    image.src = item.url!
  }

  photoNode.id = item.id
  photoNode.trackId = trackId
  photoNode.materialId = item.materialId || item.id
  ;(photoNode as any).metaData = item
  photoNode.type = MATERIAL_TYPE.PHOTO
  photoNode.format = item.format as MATERIAL_TYPE.IMAGE | MATERIAL_TYPE.GIF
  photoNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  photoNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)

  if (item.transform && typeof (photoNode as any).setTransform === 'function') {
    // Photo editor uses canvas-space translate values (px from canvas center).
    // Keep preview mapping consistent with export mapping.
    const halfW = editor.canvasWidth / 2
    const halfH = editor.canvasHeight / 2
    ;(photoNode as any).setTransform({
      scale: item.transform.scale?.[0] ?? 1,
      x: (item.transform.translate?.[0] ?? 0) / halfW,
      y: (item.transform.translate?.[1] ?? 0) / halfH,
    })
  }

  photoNode.connect(editor.videoCtx.destination)
  photoNode.registerCallback('loaded', () => {
    editor.draw();
  })
}
