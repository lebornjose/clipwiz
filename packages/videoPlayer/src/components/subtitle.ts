import { Editor } from "../index"
import { ISubtitleTrackItem, MATERIAL_TYPE, TIME_CONFIG } from "@clipwiz/shared"

export interface SubtitleBinding {
  item: ISubtitleTrackItem
  subtitleNode: any
  canvas: HTMLCanvasElement
  pagCanvas: HTMLCanvasElement | null
  pagSize: { width: number; height: number }
  anchor: { cx: number; cy: number; width: number; height: number } | null
  pagView: any | null
  textLayer: any | null
  update: (patch: Partial<ISubtitleTrackItem>) => void
}

const toPagColor = (rgb: [number, number, number]) => ({
  red: rgb[0],
  green: rgb[1],
  blue: rgb[2],
  alpha: 255,
})

const findFirstTextLayer = (composition: any): any | null => {
  if (!composition || typeof composition.numChildren !== 'function') return null
  const total = composition.numChildren()
  for (let i = 0; i < total; i++) {
    const layer = composition.getLayerAt(i)
    if (layer && typeof layer.layerType === 'function' && layer.layerType() === 3) {
      return layer
    }
    if (layer && typeof layer.numChildren === 'function' && layer.numChildren() > 0) {
      const nested = findFirstTextLayer(layer)
      if (nested) return nested
    }
  }
  return null
}

const applyTextToLayer = (textLayer: any | null, text: string) => {
  if (!textLayer) return
  if (typeof textLayer.setText === 'function') {
    textLayer.setText(text)
  }
}

const applyStyleToLayer = (textLayer: any | null, item: ISubtitleTrackItem) => {
  if (!textLayer) return
  if (item.fontFamily && typeof textLayer.setFontFamily === 'function') {
    textLayer.setFontFamily(item.fontFamily)
  }
  if (item.fontSize !== undefined && typeof textLayer.setFontSize === 'function') {
    textLayer.setFontSize(item.fontSize)
  }
  if (item.strokeWidth !== undefined && typeof textLayer.setStrokeWidth === 'function') {
    textLayer.setStrokeWidth(item.strokeWidth)
  }
  if (item.color && typeof textLayer.setFillColor === 'function') {
    textLayer.setFillColor(toPagColor(item.color))
  }
  if (item.strokeColor && typeof textLayer.setStrokeColor === 'function') {
    textLayer.setStrokeColor(toPagColor(item.strokeColor))
  }
}

const getPagSize = (pagFile: any, fallbackW: number, fallbackH: number) => {
  const rawW = typeof pagFile?.width === 'function' ? Number(pagFile.width()) : fallbackW
  const rawH = typeof pagFile?.height === 'function' ? Number(pagFile.height()) : fallbackH
  return {
    width: Number.isFinite(rawW) && rawW > 0 ? Math.round(rawW) : fallbackW,
    height: Number.isFinite(rawH) && rawH > 0 ? Math.round(rawH) : fallbackH,
  }
}

const getTargetPosition = (item: ISubtitleTrackItem, width: number, height: number) => {
  const x = Number.isFinite(Number(item.position?.[0])) ? Number(item.position?.[0]) : width / 2
  const rawY = Number.isFinite(Number(item.position?.[1])) ? Number(item.position?.[1]) : height / 2
  return { x, y: height - rawY }
}

const findAlphaBounds = (source: HTMLCanvasElement, sourceW: number, sourceH: number) => {
  const probeCanvas = document.createElement('canvas')
  probeCanvas.width = sourceW
  probeCanvas.height = sourceH
  const probeCtx = probeCanvas.getContext('2d', { willReadFrequently: true })
  if (!probeCtx) return { cx: sourceW / 2, cy: sourceH / 2, width: sourceW, height: sourceH }
  probeCtx.clearRect(0, 0, sourceW, sourceH)
  probeCtx.drawImage(source, 0, 0, sourceW, sourceH)
  const data = probeCtx.getImageData(0, 0, sourceW, sourceH).data
  let minX = sourceW
  let minY = sourceH
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < sourceH; y++) {
    for (let x = 0; x < sourceW; x++) {
      const alpha = data[(y * sourceW + x) * 4 + 3]
      if (alpha <= 4) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < minX || maxY < minY) return { cx: sourceW / 2, cy: sourceH / 2, width: sourceW, height: sourceH }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, width: maxX - minX + 1, height: maxY - minY + 1 }
}

const drawPagToCanvas = (binding: SubtitleBinding, canvasWidth: number, canvasHeight: number) => {
  const ctx = binding.canvas.getContext('2d')
  if (!ctx || !binding.pagCanvas) return
  const { width: pagW, height: pagH } = binding.pagSize
  const fitScale = Math.min(canvasWidth / pagW, canvasHeight / pagH)
  const drawW = Math.max(1, Math.round(pagW * fitScale))
  const drawH = Math.max(1, Math.round(pagH * fitScale))
  if (!binding.anchor) {
    binding.anchor = findAlphaBounds(binding.pagCanvas, pagW, pagH)
  }
  const desiredTextHeight = Math.max(1, binding.item.fontSize || 0)
  const maxTextWidth = Math.max(1, canvasWidth * 0.92)
  const heightScale = desiredTextHeight > 0 ? desiredTextHeight / Math.max(1, binding.anchor.height * fitScale) : 1
  const widthScale = maxTextWidth / Math.max(1, binding.anchor.width * fitScale)
  const contentScale = Math.max(0.01, Math.min(heightScale, widthScale, 8))
  const finalScale = fitScale * contentScale
  const target = getTargetPosition(binding.item, canvasWidth, canvasHeight)
  const drawX = Math.round(target.x - binding.anchor.cx * finalScale)
  const drawY = Math.round(target.y - binding.anchor.cy * finalScale)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.drawImage(binding.pagCanvas, drawX, drawY, Math.round(drawW * contentScale), Math.round(drawH * contentScale))
}

export const addSubtitleNode = (editor: Editor, trackId: string, item: ISubtitleTrackItem) => {
  const canvas = document.createElement('canvas')
  canvas.width = editor.canvasWidth
  canvas.height = editor.canvasHeight
  canvas.style.width = `${editor.canvasWidth}px`
  canvas.style.height = `${editor.canvasHeight}px`

  const subtitleNode = editor.videoCtx.canvas(canvas) as any
  subtitleNode.id = item.id
  subtitleNode.trackId = trackId
  subtitleNode.type = MATERIAL_TYPE.SUBTITLE
  subtitleNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  subtitleNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  subtitleNode.connect(editor.videoCtx.destination)

  const binding: SubtitleBinding = {
    item,
    subtitleNode,
    canvas,
    pagCanvas: null,
    pagSize: { width: editor.canvasWidth, height: editor.canvasHeight },
    anchor: null,
    pagView: null,
    textLayer: null,
    update: (patch) => {
      binding.item = { ...binding.item, ...patch }
      if (patch.text !== undefined) {
        applyTextToLayer(binding.textLayer, patch.text)
        binding.anchor = null
      }
      if (
        patch.fontFamily !== undefined ||
        patch.fontSize !== undefined ||
        patch.strokeWidth !== undefined ||
        patch.color !== undefined ||
        patch.strokeColor !== undefined
      ) {
        applyStyleToLayer(binding.textLayer, binding.item)
      }
      if (binding.pagView && typeof binding.pagView.flush === 'function') {
        void binding.pagView.flush().then(() => {
          drawPagToCanvas(binding, editor.canvasWidth, editor.canvasHeight)
          editor.draw()
        })
      }
    },
  }
  editor.subtitleRegistry.set(item.id, binding)

  const durationSec = Math.max(
    0.001,
    (item.endTime - item.startTime) / TIME_CONFIG.MILL_TIME_CONVERSION,
  )
  const syncByTimeline = () => {
    if (!binding.pagView) return
    const currentSec = editor.videoCtx.currentTime
    const startSec = item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION
    const normalized = Math.max(0, Math.min(1, (currentSec - startSec) / durationSec))
    if (typeof binding.pagView.setProgress === 'function') {
      binding.pagView.setProgress(normalized)
    }
    if (typeof binding.pagView.flush === 'function') {
      void binding.pagView.flush().then(() => {
        drawPagToCanvas(binding, editor.canvasWidth, editor.canvasHeight)
        editor.draw()
      })
    }
  }

  subtitleNode.registerCallback('seek', () => {
    syncByTimeline()
  })

  subtitleNode.registerCallback('play', () => {
    if (binding.pagView && typeof binding.pagView.play === 'function') {
      binding.pagView.play()
      return
    }
    syncByTimeline()
  })

  subtitleNode.registerCallback('pause', () => {
    if (binding.pagView && typeof binding.pagView.pause === 'function') {
      binding.pagView.pause()
      return
    }
    syncByTimeline()
  })

  void (async () => {
    try {
      await editor.pag.waitForReady()
      const PAG = editor.pag.PAG
      if (!PAG || !item.url) return

      const buffer = await fetch(item.url).then((resp) => resp.arrayBuffer())
      const pagFile = await PAG.PAGFile.load(buffer)
      binding.pagSize = getPagSize(pagFile, editor.canvasWidth, editor.canvasHeight)
      const pagCanvas = document.createElement('canvas')
      pagCanvas.width = binding.pagSize.width
      pagCanvas.height = binding.pagSize.height
      binding.pagCanvas = pagCanvas
      binding.pagView = await PAG.PAGView.init(pagFile, pagCanvas)
      binding.textLayer = findFirstTextLayer(pagFile)
      applyTextToLayer(binding.textLayer, binding.item.text || '')
      applyStyleToLayer(binding.textLayer, binding.item)

      if (typeof binding.pagView.setRepeatCount === 'function') {
        binding.pagView.setRepeatCount(0)
      }
      syncByTimeline()
    } catch (error) {
      console.error('subtitle init failed:', error)
    }
  })()

  return subtitleNode
}
