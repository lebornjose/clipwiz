import { Editor } from "../index"
import { ITextTrackItem, MATERIAL_TYPE, TIME_CONFIG } from "@clipwiz/shared"

const DEBUG_TEXT_PAG = true
const logTextPag = (...args: any[]) => {
  if (!DEBUG_TEXT_PAG) return
  console.log('[TEXT-PAG]', ...args)
}

export interface TextBinding {
  item: ITextTrackItem
  textNode: any
  canvas: HTMLCanvasElement
  pagCanvas: HTMLCanvasElement | null
  pagSize: { width: number; height: number }
  anchor: { cx: number; cy: number; width: number; height: number } | null
  pagView: any | null
  pagFile: any | null
  editableTextIndices: number[]
  editableTextLayers: Map<number, any[]>
  textLayers: any[]
  textState: {
    text: string
    fontFamily?: string
    fontSize?: number
    strokeWidth?: number
    color?: [number, number, number]
    strokeColor?: [number, number, number]
  }
  update: (patch: Partial<ITextTrackItem>) => void
}

const findAllTextLayers = (composition: any, output: any[] = []): any[] => {
  if (!composition || typeof composition.numChildren !== 'function') return output
  const total = composition.numChildren()
  for (let i = 0; i < total; i++) {
    const layer = composition.getLayerAt(i)
    if (layer && typeof layer.layerType === 'function' && layer.layerType() === 3) {
      output.push(layer)
    }
    if (layer && typeof layer.numChildren === 'function' && layer.numChildren() > 0) {
      findAllTextLayers(layer, output)
    }
  }
  return output
}

const toPagColor = (rgb: [number, number, number]) => ({
  red: rgb[0],
  green: rgb[1],
  blue: rgb[2],
})

const getPagSize = (pagFile: any, fallbackW: number, fallbackH: number) => {
  const rawW = typeof pagFile?.width === 'function' ? Number(pagFile.width()) : fallbackW
  const rawH = typeof pagFile?.height === 'function' ? Number(pagFile.height()) : fallbackH
  return {
    width: Number.isFinite(rawW) && rawW > 0 ? Math.round(rawW) : fallbackW,
    height: Number.isFinite(rawH) && rawH > 0 ? Math.round(rawH) : fallbackH,
  }
}

const getTargetPosition = (item: ITextTrackItem, width: number, height: number) => {
  const pos = item.position
  if (!pos) return null
  const x = Number.isFinite(Number(pos[0])) ? Number(pos[0]) : width / 2
  const y = Number.isFinite(Number(pos[1])) ? Number(pos[1]) : height / 2
  return { x, y }
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

const drawPagToCanvas = (binding: TextBinding, canvasWidth: number, canvasHeight: number) => {
  const ctx = binding.canvas.getContext('2d')
  if (!ctx || !binding.pagCanvas) return
  const { width: pagW, height: pagH } = binding.pagSize
  const fitScale = Math.min(canvasWidth / pagW, canvasHeight / pagH)
  const drawW = Math.max(1, Math.round(pagW * fitScale))
  const drawH = Math.max(1, Math.round(pagH * fitScale))
  if (!binding.anchor) {
    binding.anchor = findAlphaBounds(binding.pagCanvas, pagW, pagH)
  }
  const desiredTextHeight = Math.max(1, binding.textState.fontSize || 0)
  const maxTextWidth = Math.max(1, canvasWidth * 0.92)
  const heightScale = desiredTextHeight > 0 ? desiredTextHeight / Math.max(1, binding.anchor.height * fitScale) : 1
  const widthScale = maxTextWidth / Math.max(1, binding.anchor.width * fitScale)
  const contentScale = Math.max(0.01, Math.min(heightScale, widthScale, 8))
  const finalScale = fitScale * contentScale
  const target = getTargetPosition(binding.item, canvasWidth, canvasHeight)
  const drawX = target
    ? Math.round(target.x - binding.anchor.cx * finalScale)
    : Math.round((canvasWidth - drawW * contentScale) / 2)
  const drawY = target
    ? Math.round(target.y - binding.anchor.cy * finalScale)
    : Math.round((canvasHeight - drawH * contentScale) / 2)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.drawImage(binding.pagCanvas, drawX, drawY, Math.round(drawW * contentScale), Math.round(drawH * contentScale))
}

const applyLegacyTextLayers = (binding: TextBinding) => {
  if (!binding.textLayers.length) return
  logTextPag('apply legacy text layers', {
    id: binding.item.id,
    layerCount: binding.textLayers.length,
    text: binding.textState.text,
  })
  binding.textLayers.forEach((layer) => {
    if (!layer) return
    if (typeof layer.setText === 'function') {
      layer.setText(binding.textState.text ?? '')
    }
    if (binding.textState.fontFamily && typeof layer.setFontFamily === 'function') {
      layer.setFontFamily(binding.textState.fontFamily)
    }
    if (binding.textState.fontSize !== undefined && typeof layer.setFontSize === 'function') {
      layer.setFontSize(binding.textState.fontSize)
    }
    if (binding.textState.strokeWidth !== undefined && typeof layer.setStrokeWidth === 'function') {
      layer.setStrokeWidth(binding.textState.strokeWidth)
    }
    if (binding.textState.color && typeof layer.setFillColor === 'function') {
      layer.setFillColor(toPagColor(binding.textState.color))
    }
    if (binding.textState.strokeColor && typeof layer.setStrokeColor === 'function') {
      layer.setStrokeColor(toPagColor(binding.textState.strokeColor))
    }
  })
}

const applyReplaceableText = (binding: TextBinding) => {
  const file = binding.pagFile
  if (!file) return

  logTextPag('apply replaceable text begin', {
    id: binding.item.id,
    editableTextIndices: binding.editableTextIndices,
    textState: binding.textState,
  })

  if (binding.editableTextIndices.length) {
    binding.editableTextIndices.forEach((idx) => {
      try {
        const textData = file.getTextData(idx)
        logTextPag('before replaceText', {
          id: binding.item.id,
          idx,
          text: textData?.text,
          fontFamily: textData?.fontFamily,
          fontSize: textData?.fontSize,
          strokeWidth: textData?.strokeWidth,
        })
        textData.text = binding.textState.text ?? ''
        if (binding.textState.fontFamily) textData.fontFamily = binding.textState.fontFamily
        if (binding.textState.fontSize !== undefined) textData.fontSize = binding.textState.fontSize
        if (binding.textState.strokeWidth !== undefined) textData.strokeWidth = binding.textState.strokeWidth
        if (binding.textState.color) textData.fillColor = toPagColor(binding.textState.color)
        if (binding.textState.strokeColor) textData.strokeColor = toPagColor(binding.textState.strokeColor)
        file.replaceText(idx, textData)
        logTextPag('after replaceText', {
          id: binding.item.id,
          idx,
          text: textData?.text,
          fontFamily: textData?.fontFamily,
          fontSize: textData?.fontSize,
          strokeWidth: textData?.strokeWidth,
        })
        if (typeof textData.delete === 'function') {
          textData.delete()
        }
      } catch (error) {
        console.warn(`replaceText failed on editable index ${idx}:`, error)
      }
    })
  }

  // 对可编辑索引对应的 PAGTextLayer 做直接写入，兼容部分模板对 replaceText 不敏感的情况
  binding.editableTextLayers.forEach((layers, idx) => {
    layers.forEach((layer) => {
      try {
        if (typeof layer.setText === 'function') {
          layer.setText(binding.textState.text ?? '')
        }
        if (binding.textState.fontSize !== undefined && typeof layer.setFontSize === 'function') {
          layer.setFontSize(binding.textState.fontSize)
        }
        if (binding.textState.color && typeof layer.setFillColor === 'function') {
          layer.setFillColor(toPagColor(binding.textState.color))
        }
        if (binding.textState.strokeColor && typeof layer.setStrokeColor === 'function') {
          layer.setStrokeColor(toPagColor(binding.textState.strokeColor))
        }
      } catch (error) {
        console.warn(`direct PAGTextLayer update failed on editable index ${idx}:`, error)
      }
    })
  })

  // 兜底：兼容直接文本层可编辑的 PAG 结构
  applyLegacyTextLayers(binding)
}

export const addTextNode = async (editor: Editor, trackId: string, item: ITextTrackItem) => {
  const canvas = document.createElement('canvas')
  canvas.width = editor.canvasWidth
  canvas.height = editor.canvasHeight
  canvas.style.width = `${editor.canvasWidth}px`
  canvas.style.height = `${editor.canvasHeight}px`
  const textNode = editor.videoCtx.canvas(canvas) as any;

  textNode.id = item.id
  textNode.trackId = trackId
  textNode.type = MATERIAL_TYPE.TEXT
  textNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  textNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  textNode.connect(editor.videoCtx.destination)

  const binding: TextBinding = {
    item,
    textNode,
    canvas,
    pagCanvas: null,
    pagSize: { width: editor.canvasWidth, height: editor.canvasHeight },
    anchor: null,
    pagView: null,
    pagFile: null,
    editableTextIndices: [],
    editableTextLayers: new Map(),
    textLayers: [],
    textState: {
      text: item.text || '',
      fontFamily: item.fontFamily,
      fontSize: item.fontSize,
      strokeWidth: item.strokeWidth,
      color: item.color,
      strokeColor: item.strokeColor,
    },
    update: (patch) => {
      const prevUrl = binding.item.url
      binding.item = { ...binding.item, ...patch }
      logTextPag('update patch', {
        id: binding.item.id,
        patch,
      })

      if (patch.url !== undefined && patch.url && patch.url !== prevUrl) {
        void loadComposition(patch.url)
        return
      }

      if (patch.text !== undefined) {
        binding.textState.text = patch.text
        binding.anchor = null
      }
      if (patch.fontFamily !== undefined) {
        binding.textState.fontFamily = patch.fontFamily
      }
      if (patch.fontSize !== undefined) {
        binding.textState.fontSize = patch.fontSize
      }
      if (patch.strokeWidth !== undefined) {
        binding.textState.strokeWidth = patch.strokeWidth
      }
      if (patch.color !== undefined) {
        binding.textState.color = patch.color as [number, number, number]
      }
      if (patch.strokeColor !== undefined) {
        binding.textState.strokeColor = patch.strokeColor as [number, number, number]
      }

      applyReplaceableText(binding)

      // 文案更新后强制以当前时间重绘一帧，避免“数据变了但画面不刷新”
      syncByTimeline()
    },
  }
  editor.textRegistry.set(item.id, binding)

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
        void editor.draw()
      }).catch(() => {
        // ignore
      })
    }
  }

  textNode.registerCallback('play', () => {
    if (binding.pagView && typeof binding.pagView.play === 'function') {
      binding.pagView.play()
      return
    }
    syncByTimeline()
  })

  textNode.registerCallback('seek', () => {
    syncByTimeline()
  })

  textNode.registerCallback('pause', () => {
    if (binding.pagView && typeof binding.pagView.pause === 'function') {
      binding.pagView.pause()
      return
    }
    syncByTimeline()
  })

  const loadComposition = async (url?: string) => {
    if (!url) return
    await editor.pag.waitForReady()
    const PAG = editor.pag.PAG
    if (!PAG) return

    logTextPag('load composition start', {
      id: item.id,
      url,
    })

    const buffer = await fetch(url).then((response) => response.arrayBuffer())
    const pagFile = await PAG.PAGFile.load(buffer)
    binding.pagFile = pagFile
    binding.pagSize = getPagSize(pagFile, editor.canvasWidth, editor.canvasHeight)
    const pagCanvas = document.createElement('canvas')
    pagCanvas.width = binding.pagSize.width
    pagCanvas.height = binding.pagSize.height
    binding.pagCanvas = pagCanvas

    if (binding.pagView && typeof binding.pagView.setComposition === 'function') {
      binding.pagView.setComposition(pagFile)
    } else {
      binding.pagView = await PAG.PAGView.init(pagFile, pagCanvas)
    }
    // 编辑态关闭缓存，避免模板静态缓存导致文案替换后仍显示旧帧
    if (typeof binding.pagView?.setCacheEnabled === 'function') {
      binding.pagView.setCacheEnabled(false)
    }
    if (typeof binding.pagView?.setRepeatCount === 'function') {
      binding.pagView.setRepeatCount(0)
    }

    const numTexts = typeof pagFile.numTexts === 'function' ? pagFile.numTexts() : 0
    const numImages = typeof pagFile.numImages === 'function' ? pagFile.numImages() : -1
    logTextPag('composition meta', {
      id: item.id,
      url,
      numTexts,
      numImages,
      width: typeof pagFile.width === 'function' ? pagFile.width() : undefined,
      height: typeof pagFile.height === 'function' ? pagFile.height() : undefined,
    })
    if (numTexts > 0) {
      // replaceText 的有效索引范围严格是 [0, numTexts)
      binding.editableTextIndices = Array.from({ length: numTexts }).map((_, i) => i)
    } else {
      binding.editableTextIndices = []
    }
    binding.editableTextLayers = new Map()
    if (typeof pagFile.getLayersByEditableIndex === 'function' && PAG.LayerType?.Text !== undefined) {
      binding.editableTextIndices.forEach((idx) => {
        try {
          const vec = pagFile.getLayersByEditableIndex(idx, PAG.LayerType.Text)
          const layers: any[] = []
          if (vec && typeof vec.size === 'function' && typeof vec.get === 'function') {
            const size = vec.size()
            for (let i = 0; i < size; i++) {
              layers.push(vec.get(i))
            }
          }
          binding.editableTextLayers.set(idx, layers)
        } catch (error) {
          console.warn(`getLayersByEditableIndex failed on ${idx}:`, error)
          binding.editableTextLayers.set(idx, [])
        }
      })
    }
    binding.textLayers = findAllTextLayers(pagFile, [])
    logTextPag('composition text targets', {
      id: item.id,
      editableTextIndices: binding.editableTextIndices,
      editableLayerMap: Array.from(binding.editableTextLayers.entries()).map(([k, v]) => ({ idx: k, count: v.length })),
      fallbackLayerCount: binding.textLayers.length,
    })
    applyReplaceableText(binding)

    syncByTimeline()
  }

  try {
    await loadComposition(item.url)
  } catch (error) {
    console.error('text pag init failed:', error)
  }

  return textNode;
}
