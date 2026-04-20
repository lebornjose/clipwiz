import { Editor } from "../index"
import { ISubtitleTrackItem, MATERIAL_TYPE, TIME_CONFIG } from "@clipwiz/shared"

export interface SubtitleBinding {
  item: ISubtitleTrackItem
  subtitleNode: any
  canvas: HTMLCanvasElement
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

const applyPositionToNode = (subtitleNode: any, canvasWidth: number, canvasHeight: number, item: ISubtitleTrackItem) => {
  if (!subtitleNode || typeof subtitleNode.setTransform !== 'function') return
  const px = item.position?.[0] ?? canvasWidth / 2
  const py = item.position?.[1] ?? canvasHeight / 2
  const halfW = canvasWidth / 2
  const halfH = canvasHeight / 2
  subtitleNode.setTransform({
    scale: 1,
    x: (px - halfW) / halfW,
    y: (py - halfH) / halfH,
  })
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
    pagView: null,
    textLayer: null,
    update: (patch) => {
      binding.item = { ...binding.item, ...patch }
      if (patch.text !== undefined) {
        applyTextToLayer(binding.textLayer, patch.text)
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
      if (patch.position !== undefined) {
        applyPositionToNode(binding.subtitleNode, editor.canvasWidth, editor.canvasHeight, binding.item)
      }
      if (binding.pagView && typeof binding.pagView.flush === 'function') {
        binding.pagView.flush()
      }
    },
  }
  editor.subtitleRegistry.set(item.id, binding)
  applyPositionToNode(subtitleNode, editor.canvasWidth, editor.canvasHeight, item)

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
      binding.pagView.flush()
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
      binding.pagView = await PAG.PAGView.init(pagFile, canvas)
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
