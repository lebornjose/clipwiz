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

const applyPositionToNode = (textNode: any, canvasWidth: number, canvasHeight: number, item: ITextTrackItem) => {
  if (!textNode || typeof textNode.setTransform !== 'function') return
  const px = item.position?.[0] ?? canvasWidth / 2
  const py = item.position?.[1] ?? canvasHeight / 2
  const halfW = canvasWidth / 2
  const halfH = canvasHeight / 2
  textNode.setTransform({
    scale: 1,
    x: (px - halfW) / halfW,
    y: (py - halfH) / halfH,
  })
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

      if (patch.position !== undefined) {
        applyPositionToNode(binding.textNode, editor.canvasWidth, editor.canvasHeight, binding.item)
      }
      // 文案更新后强制以当前时间重绘一帧，避免“数据变了但画面不刷新”
      syncByTimeline()
    },
  }
  editor.textRegistry.set(item.id, binding)
  applyPositionToNode(textNode, editor.canvasWidth, editor.canvasHeight, item)

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

    if (binding.pagView && typeof binding.pagView.setComposition === 'function') {
      binding.pagView.setComposition(pagFile)
    } else {
      binding.pagView = await PAG.PAGView.init(pagFile, canvas)
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
