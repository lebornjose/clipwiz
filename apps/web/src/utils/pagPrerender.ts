import { PAGInit } from 'libpag'
import type { ITrackInfo, ITrack, IPhotoTrackItem, ISubtitleTrackItem, ITextTrackItem } from '@clipwiz/shared'
import { MATERIAL_TYPE } from '@clipwiz/shared'

type PagEditableItem = ISubtitleTrackItem | ITextTrackItem
type PagMattePhotoItem = IPhotoTrackItem & {
  colorUrl: string
  alphaUrl: string
}

let pagReadyPromise: Promise<any> | null = null

const getPAG = async () => {
  if (!pagReadyPromise) {
    pagReadyPromise = PAGInit({
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) return '/libpag.wasm'
        return file
      },
    })
  }
  return pagReadyPromise
}

const toPagColor = (rgb?: [number, number, number]) => {
  const safe = rgb ?? [255, 255, 255]
  return { red: safe[0], green: safe[1], blue: safe[2], alpha: 255 }
}

const findFirstTextLayer = (composition: any): any | null => {
  if (!composition || typeof composition.numChildren !== 'function') return null
  const total = composition.numChildren()
  for (let i = 0; i < total; i++) {
    const layer = composition.getLayerAt(i)
    if (layer && typeof layer.layerType === 'function' && layer.layerType() === 3) return layer
    if (layer && typeof layer.numChildren === 'function' && layer.numChildren() > 0) {
      const nested = findFirstTextLayer(layer)
      if (nested) return nested
    }
  }
  return null
}

const applySubtitlePatch = (pagFile: any, item: ISubtitleTrackItem) => {
  const textLayer = findFirstTextLayer(pagFile)
  if (!textLayer) return
  if (typeof textLayer.setText === 'function') textLayer.setText(item.text || '')
  if (item.fontFamily && typeof textLayer.setFontFamily === 'function') textLayer.setFontFamily(item.fontFamily)
  if (item.fontSize !== undefined && typeof textLayer.setFontSize === 'function') textLayer.setFontSize(item.fontSize)
  if (item.strokeWidth !== undefined && typeof textLayer.setStrokeWidth === 'function') textLayer.setStrokeWidth(item.strokeWidth)
  if (item.color && typeof textLayer.setFillColor === 'function') textLayer.setFillColor(toPagColor(item.color))
  if (item.strokeColor && typeof textLayer.setStrokeColor === 'function') textLayer.setStrokeColor(toPagColor(item.strokeColor))
}

const applyTextPatch = (pagFile: any, item: ITextTrackItem) => {
  const text = item.text || ''
  const numTexts = typeof pagFile.numTexts === 'function' ? pagFile.numTexts() : 0
  if (numTexts > 0 && typeof pagFile.getTextData === 'function' && typeof pagFile.replaceText === 'function') {
    for (let i = 0; i < numTexts; i++) {
      try {
        const td = pagFile.getTextData(i)
        td.text = text
        if (item.fontFamily) td.fontFamily = item.fontFamily
        if (item.fontSize !== undefined) td.fontSize = item.fontSize
        if (item.strokeWidth !== undefined) td.strokeWidth = item.strokeWidth
        if (item.color) td.fillColor = toPagColor(item.color)
        if (item.strokeColor) td.strokeColor = toPagColor(item.strokeColor)
        pagFile.replaceText(i, td)
        if (typeof td.delete === 'function') td.delete()
      } catch {
        // fallback below
      }
    }
    return
  }
  applySubtitlePatch(pagFile, item as unknown as ISubtitleTrackItem)
}

const pickRecorderMime = () => {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) || ''
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const createRecorder = (canvas: HTMLCanvasElement, fps: number, mimeType: string, label: string) => {
  const stream = canvas.captureStream(fps)
  const chunks: BlobPart[] = []
  const recorder = new MediaRecorder(stream, { mimeType })
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }
  const stopPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error(`${label} 预渲染录制失败`))
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      resolve(new Blob(chunks, { type: mimeType }))
    }
  })
  recorder.start()
  return {
    recorder,
    stopPromise,
    requestFrame: () => {
      const videoTrack = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined
      if (typeof videoTrack?.requestFrame === 'function') videoTrack.requestFrame()
    },
  }
}

const normalizeTimelineMs = (value: number): number => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n)
}

const getPagDurationSec = (pagFile: any): number => {
  if (!pagFile || typeof pagFile.duration !== 'function') return 0
  const raw = Number(pagFile.duration())
  if (!Number.isFinite(raw) || raw <= 0) return 0
  if (raw > 100000) return raw / 1_000_000
  if (raw > 1000) return raw / 1000
  return raw
}

const getPagSize = (pagFile: any, fallbackW: number, fallbackH: number) => {
  const rawW = typeof pagFile?.width === 'function' ? Number(pagFile.width()) : fallbackW
  const rawH = typeof pagFile?.height === 'function' ? Number(pagFile.height()) : fallbackH
  return {
    width: Number.isFinite(rawW) && rawW > 0 ? Math.round(rawW) : fallbackW,
    height: Number.isFinite(rawH) && rawH > 0 ? Math.round(rawH) : fallbackH,
  }
}

const getTargetPosition = (item: PagEditableItem, width: number, height: number) => {
  const pos = item.position
  if (!pos) return null
  const x = Number.isFinite(Number(pos[0])) ? Number(pos[0]) : width / 2
  const rawY = Number.isFinite(Number(pos[1])) ? Number(pos[1]) : height / 2
  // 字幕协议里的 y 按预览表现是“距离底部”的偏移；花字保持常规画布 y 坐标。
  const y = item.format === MATERIAL_TYPE.SUBTITLE ? height - rawY : rawY
  return { x, y }
}

const findAlphaBounds = (
  source: HTMLCanvasElement,
  sourceW: number,
  sourceH: number,
): { cx: number; cy: number; width: number; height: number } => {
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
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

const renderPagItemToMatteWebm = async (
  item: PagEditableItem,
  startMs: number,
  endMs: number,
  width: number,
  height: number,
  fps: number,
): Promise<{ colorBlob: Blob; alphaBlob: Blob }> => {
  if (!item.url) throw new Error('PAG 资源 URL 为空')
  if (typeof MediaRecorder === 'undefined') throw new Error('当前浏览器不支持 MediaRecorder')

  const PAG = await getPAG()
  const buffer = await fetch(item.url).then((resp) => resp.arrayBuffer())
  const pagFile = await PAG.PAGFile.load(buffer)

  const pagSize = getPagSize(pagFile, width, height)
  const pagCanvas = document.createElement('canvas')
  pagCanvas.width = pagSize.width
  pagCanvas.height = pagSize.height
  const pagView = await PAG.PAGView.init(pagFile, pagCanvas)
  if (typeof pagView.setRepeatCount === 'function') pagView.setRepeatCount(0)
  if (typeof pagView.setCacheEnabled === 'function') pagView.setCacheEnabled(false)

  if (item.format === MATERIAL_TYPE.SUBTITLE) {
    applySubtitlePatch(pagFile, item as ISubtitleTrackItem)
  } else {
    applyTextPatch(pagFile, item as ITextTrackItem)
  }

  const mimeType = pickRecorderMime()
  if (!mimeType) throw new Error('当前浏览器不支持 webm 编码')

  const colorCanvas = document.createElement('canvas')
  colorCanvas.width = width
  colorCanvas.height = height
  const colorCtx = colorCanvas.getContext('2d')
  if (!colorCtx) throw new Error('无法创建 color 2D 上下文')

  const alphaCanvas = document.createElement('canvas')
  alphaCanvas.width = width
  alphaCanvas.height = height
  const alphaCtx = alphaCanvas.getContext('2d', { willReadFrequently: true })
  if (!alphaCtx) throw new Error('无法创建 alpha 2D 上下文')

  const matteCanvas = document.createElement('canvas')
  matteCanvas.width = width
  matteCanvas.height = height
  const matteCtx = matteCanvas.getContext('2d', { willReadFrequently: true })
  if (!matteCtx) throw new Error('无法创建 matte 2D 上下文')

  const durationSec = Math.max(0.04, (endMs - startMs) / 1000)
  const totalFrames = Math.max(1, Math.ceil(durationSec * fps))
  const frameDelay = Math.max(1, Math.floor(1000 / fps))
  const pagDurationSec = getPagDurationSec(pagFile)
  const fitScale = Math.min(width / pagSize.width, height / pagSize.height)
  const drawW = Math.max(1, Math.round(pagSize.width * fitScale))
  const drawH = Math.max(1, Math.round(pagSize.height * fitScale))
  const targetPosition = getTargetPosition(item, width, height)
  let anchor: { cx: number; cy: number; width: number; height: number } | null = null
  const colorRecorder = createRecorder(colorCanvas, fps, mimeType, 'color')
  const alphaRecorder = createRecorder(alphaCanvas, fps, mimeType, 'alpha')

  for (let i = 0; i < totalFrames; i++) {
    const elapsedSec = i / fps
    // 和 Web 播放一致：播放态 PAG 按模板自身时长推进，素材区间只控制出现/消失。
    const progress = pagDurationSec > 0
      ? ((elapsedSec % pagDurationSec) / pagDurationSec)
      : Math.max(0, Math.min(1, elapsedSec / durationSec))
    if (typeof pagView.setProgress === 'function') pagView.setProgress(progress)
    if (typeof pagView.flush === 'function') await pagView.flush()
    if (!anchor) {
      anchor = targetPosition ? findAlphaBounds(pagCanvas, pagSize.width, pagSize.height) : {
        cx: pagSize.width / 2,
        cy: pagSize.height / 2,
        width: pagSize.width,
        height: pagSize.height,
      }
    }
    const itemFontSize = item.fontSize || 0
    const desiredTextHeight = Math.max(1, itemFontSize)
    const maxTextWidth = Math.max(1, width * 0.92)
    const heightScale = itemFontSize > 0 ? desiredTextHeight / Math.max(1, anchor.height * fitScale) : 1
    const widthScale = maxTextWidth / Math.max(1, anchor.width * fitScale)
    const contentScale = Math.max(0.01, Math.min(heightScale, widthScale, 8))
    const finalScale = fitScale * contentScale

    const drawX = targetPosition
      ? Math.round(targetPosition.x - anchor.cx * finalScale)
      : Math.round((width - drawW * contentScale) / 2)
    const drawY = targetPosition
      ? Math.round(targetPosition.y - anchor.cy * finalScale)
      : Math.round((height - drawH * contentScale) / 2)

    colorCtx.fillStyle = '#000000'
    colorCtx.fillRect(0, 0, width, height)
    colorCtx.drawImage(pagCanvas, drawX, drawY, Math.round(drawW * contentScale), Math.round(drawH * contentScale))

    matteCtx.clearRect(0, 0, width, height)
    matteCtx.drawImage(pagCanvas, drawX, drawY, Math.round(drawW * contentScale), Math.round(drawH * contentScale))
    const frame = matteCtx.getImageData(0, 0, width, height)
    const data = frame.data
    for (let p = 0; p < data.length; p += 4) {
      const alpha = data[p + 3]
      data[p] = alpha
      data[p + 1] = alpha
      data[p + 2] = alpha
      data[p + 3] = 255
    }
    alphaCtx.putImageData(frame, 0, 0)

    colorRecorder.requestFrame()
    alphaRecorder.requestFrame()
    await wait(frameDelay)
  }

  await wait(50)
  colorRecorder.recorder.stop()
  alphaRecorder.recorder.stop()
  const [colorBlob, alphaBlob] = await Promise.all([colorRecorder.stopPromise, alphaRecorder.stopPromise])
  if (typeof pagView.destroy === 'function') pagView.destroy()
  if (typeof pagFile.delete === 'function') pagFile.delete()

  return { colorBlob, alphaBlob }
}

const uploadRenderedVideo = async (blob: Blob, name: string): Promise<string> => {
  if (!blob || blob.size <= 0) {
    throw new Error('预渲染结果为空，无法上传')
  }
  const file = new File([blob], `${name}.webm`, { type: 'video/webm' })
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok || !data?.file?.url) {
    throw new Error(data?.message || '预渲染素材上传失败')
  }
  // 使用服务端返回的 uploads 相对路径，避免拼到前端 dev server 域名导致 ffmpeg 拉到 HTML
  return data.file.url as string
}

const isPagEditableTrack = (track: ITrack) =>
  (track.trackType === MATERIAL_TYPE.SUBTITLE || track.trackType === MATERIAL_TYPE.TEXT) && !track.hide

const isPagPrerenderTrack = (track: ITrack) =>
  track.trackType === MATERIAL_TYPE.PHOTO
  && (String(track.trackId || '').startsWith('track-photo-prerender-')
    || String(track.trackId || '').startsWith('track-photo-matte-')
    || track.children.some((item: any) => {
      const desc = String(item?.desc || '')
      return desc.startsWith('pag-prerender-') || desc.startsWith('pag-matte-')
    }))

export const prepareTrackInfoWithPagPrerender = async (
  trackInfo: ITrackInfo,
  onProgress?: (done: number, total: number) => void,
): Promise<ITrackInfo> => {
  const width = Math.max(2, Math.floor(trackInfo.width || 1280))
  const height = Math.max(2, Math.floor(trackInfo.height || 720))
  const fps = Math.max(1, Math.floor(trackInfo.fps || 25))
  const cloned = JSON.parse(JSON.stringify(trackInfo)) as ITrackInfo
  cloned.tracks = cloned.tracks.filter((track) => !isPagPrerenderTrack(track))

  const renderList: PagEditableItem[] = []
  cloned.tracks.filter(isPagEditableTrack).forEach((track) => {
    track.children.forEach((raw) => {
      const item = raw as PagEditableItem
      if (item.hide || !item.url) return
      if (item.endTime <= item.startTime) return
      renderList.push(item)
    })
  })

  if (renderList.length === 0) return cloned

  const generated: PagMattePhotoItem[] = []
  for (let i = 0; i < renderList.length; i++) {
    const item = renderList[i]
    onProgress?.(i + 1, renderList.length)
    const startMs = normalizeTimelineMs(item.startTime)
    const endMs = Math.max(startMs + 40, normalizeTimelineMs(item.endTime))
    console.log('[pag-prerender][timeline]', {
      id: item.id,
      format: item.format,
      rawStart: item.startTime,
      rawEnd: item.endTime,
      startMs,
      endMs,
    })
    const { colorBlob, alphaBlob } = await renderPagItemToMatteWebm(item, startMs, endMs, width, height, fps)
    const name = `pag-matte-${item.id}-${Date.now()}`
    const colorUrl = await uploadRenderedVideo(colorBlob, `${name}-color`)
    const alphaUrl = await uploadRenderedVideo(alphaBlob, `${name}-alpha`)
    generated.push({
      id: `pag-matte-${item.id}`,
      materialId: item.materialId || item.id,
      url: colorUrl,
      colorUrl,
      alphaUrl,
      format: 'pagMatte' as any,
      desc: `pag-matte-${item.format}`,
      width,
      height,
      duration: endMs - startMs,
      startTime: startMs,
      endTime: endMs,
      hide: false,
      transform: {
        // PAG 已经按 Web 播放器的全画布内容渲染，导出阶段不要再移动整张画布。
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        scale: [1, 1, 1],
      },
      crop: {
        x0: 0,
        y0: 0,
        x1: width,
        y1: height,
      },
    })
  }

  if (generated.length > 0) {
    cloned.tracks.push({
      trackType: MATERIAL_TYPE.PHOTO,
      trackId: `track-photo-matte-${Date.now()}`,
      hide: false,
      children: generated,
    } as any)
  }

  return cloned
}
