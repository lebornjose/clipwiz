import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { videoQueue } from './queue.js'
import type { Job } from 'bull'
import {
  ITrackInfo, MATERIAL_TYPE,
  IVideoTrackItem, IAudioTrackItem,
  resolveTransitionBetweenItems,
} from '@clipwiz/shared'

// Map effectId → internal effect type used by buildAlphaExpr
const EFFECT_TYPE_MAP: Record<string, string> = {
  CROSSFADE:       'fade',
  DREAMFADE:       'fade',
  HORIZONTAL_WIPE: 'wipeleft',
  VERTICAL_WIPE:   'wipeup',
  STAR_WIPE:       'radial',
  STATIC_DISSOLVE: 'dissolve',
  RANDOM_DISSOLVE: 'dissolve',
}

function getEffectType(effectId?: string): string {
  return (effectId && EFFECT_TYPE_MAP[effectId.toUpperCase()]) ?? 'fade'
}

/**
 * Build a `blend=all_expr` string for the transition between two clips.
 *
 * The blend filter takes two inputs:
 *   Input 1 (A) = outgoing clip  (trim to exactly transitionDur, PTS from 0)
 *   Input 2 (B) = incoming clip  (trim to exactly transitionDur, PTS from 0)
 *
 * `progress` is a 0→1 FFmpeg expression.  In blend, T = PTS of first input in seconds.
 * When both inputs are trimmed to [0, transitionDur], progress = T / transitionDur.
 *
 * Corresponds to VideoContext GLSL (A = u_image_a = outgoing, B = u_image_b = incoming):
 *  fade     → crossfade:   result = A*(1-p)+B*p               (CROSSFADE / DREAMFADE)
 *  wipeleft → horizontal wipe, incoming reveals left→right     (HORIZONTAL_WIPE)
 *  wipeup   → vertical wipe, incoming reveals top→bottom       (VERTICAL_WIPE)
 *  radial   → 8-blade star wipe, exact GLSL triangle port      (STAR_WIPE)
 *  dissolve → static noise dissolve matching VideoContext hash  (STATIC/RANDOM_DISSOLVE)
 */
function buildBlendExpr(effectType: string, progress: string): string {
  switch (effectType) {
    case 'wipeleft':
      // GLSL: if(texCoord.x > mix) show A (outgoing) else show B (incoming)
      return `if(lt(X/W,${progress}),B,A)`
    case 'wiperight':
      return `if(gt(X/W,1-${progress}),B,A)`
    case 'wipeup':
      // GLSL: if(texCoord.y > mix) show A else show B
      return `if(lt(Y/H,${progress}),B,A)`
    case 'wipedown':
      return `if(gt(Y/H,1-${progress}),B,A)`
    case 'radial': {
      // 8-blade star wipe — direct translation of the VideoContext STAR_WIPE GLSL shader.
      //
      // GLSL: 8 isosceles triangles at 45° intervals, rotating around the frame centre.
      // Each triangle (blade i) has vertices (relative to centre, scale = mix):
      //   p0 = (0, +0.5m)   p1 = (0, -0.5m)   p2 = (2m, 0)
      //
      // Pixel (dx,dy) is inside blade i if (after rotating by −α_i):
      //   rx = dx·cos(α_i) + dy·sin(α_i)
      //   ry = −dx·sin(α_i) + dy·cos(α_i)
      //   rx > 0  AND  p > rx/2 + 2·|ry|
      // (derived from the GLSL sign()/pointInTriangle() cross-product test)
      //
      // Special cases (from GLSL): p < 0.01 → show outgoing (A), p > 0.99 → show incoming (B)
      const dx = '(X/W-0.5)'
      const dy = '(Y/H-0.5)'
      const p = progress
      // cos(π/4)/2 ≈ 0.3536,  2·sin(π/4) ≈ 1.4142
      const blades = [
        // i=0  α=0      cos=1,      sin=0
        `gt(${dx},0)*gt(${p},${dx}/2+2*abs(${dy}))`,
        // i=1  α=π/4    cos=0.7071, sin=0.7071
        `gt(${dx}+${dy},0)*gt(${p},(${dx}+${dy})*0.3536+1.4142*abs(${dy}-${dx}))`,
        // i=2  α=π/2    cos=0,      sin=1
        `gt(${dy},0)*gt(${p},${dy}/2+2*abs(${dx}))`,
        // i=3  α=3π/4   cos=-0.7071,sin=0.7071
        `gt(${dy}-${dx},0)*gt(${p},(${dy}-${dx})*0.3536+1.4142*abs(${dy}+${dx}))`,
        // i=4  α=π      cos=-1,     sin=0
        `gt(-(${dx}),0)*gt(${p},-(${dx})/2+2*abs(${dy}))`,
        // i=5  α=5π/4   cos=-0.7071,sin=-0.7071
        `gt(-(${dx}+${dy}),0)*gt(${p},-(${dx}+${dy})*0.3536+1.4142*abs(${dx}-${dy}))`,
        // i=6  α=3π/2   cos=0,      sin=-1
        `gt(-(${dy}),0)*gt(${p},-(${dy})/2+2*abs(${dx}))`,
        // i=7  α=7π/4   cos=0.7071, sin=-0.7071
        `gt(${dx}-${dy},0)*gt(${p},(${dx}-${dy})*0.3536+1.4142*abs(${dx}+${dy}))`,
      ]
      return `if(gt(${p},0.99),B,if(lt(${p},0.01),A,if(gt(${blades.join('+')},0),B,A)))`
    }
    case 'dissolve':
      // Matches VideoContext RANDOM_DISSOLVE rand() hash shader
      return `if(lte(frac(sin(X/W*12.9898+Y/H*78.233)*43758.5453),${progress}),B,A)`
    case 'fade':
    default:
      // CROSSFADE GLSL: color_a*(1-mix) + color_b*mix
      return `A*(1-${progress})+B*${progress}`
  }
}

const uploadDir = process.env.UPLOAD_DIR || './uploads'
const outputDir = path.join(uploadDir, 'output')

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 设置 FFmpeg 路径
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH)
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH)
}

export interface VideoInfo {
  duration: number
  width: number
  height: number
  format: string
  bitrate: number
}

class VideoProcessor {
  // 获取视频信息
  async getVideoInfo(fileId: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      const inputPath = this.getFilePath(fileId)

      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          return reject(err)
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video')

        if (!videoStream) {
          return reject(new Error('视频流未找到'))
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || '',
          bitrate: metadata.format.bit_rate || 0
        })
      })
    })
  }

  // 裁剪视频
  async trimVideo(fileId: string, startTime: number, endTime: number) {
    const job = await videoQueue.add({
      operation: 'trim',
      fileId,
      startTime,
      endTime
    })
    return job
  }

  // 合并视频
  async mergeVideos(fileIds: string[]) {
    const job = await videoQueue.add({
      operation: 'merge',
      fileIds
    })
    return job
  }

  // 添加水印
  async addWatermark(fileId: string, text: string, position = 'topright') {
    const job = await videoQueue.add({
      operation: 'watermark',
      fileId,
      text,
      position
    })
    return job
  }

  // 视频转码
  async transcodeVideo(fileId: string, format: string, resolution?: string) {
    const job = await videoQueue.add({
      operation: 'transcode',
      fileId,
      format,
      resolution
    })
    return job
  }

  private getFilePath(fileId: string): string {
    // 尝试找到匹配的文件
    const files = fs.readdirSync(uploadDir)
    const file = files.find(f => f.startsWith(fileId))

    if (!file) {
      throw new Error(`文件不存在: ${fileId}`)
    }

    return path.join(uploadDir, file)
  }

  private getOutputPath(extension: string): string {
    return path.join(outputDir, `${uuidv4()}.${extension}`)
  }
}

// 处理视频任务
export async function processVideoJob(job: Job): Promise<any> {
  const { operation } = job.data
  const processor = new VideoProcessor()
  console.log('33', operation);
  switch (operation) {
    case 'trim':
      return await processTrim(job, processor)
    case 'merge':
      return await processMerge(job, processor)
    case 'watermark':
      return await processWatermark(job, processor)
    case 'transcode':
      return await processTranscode(job, processor)
    case 'composite': // 合成视频
      return await processComposite(job, processor)
    default:
      throw new Error(`未知操作: ${operation}`)
  }
}

// 裁剪视频处理
async function processTrim(job: Job, processor: VideoProcessor): Promise<any> {
  const { fileId, startTime, endTime } = job.data
  const inputPath = processor['getFilePath'](fileId)
  const outputPath = processor['getOutputPath']('mp4')

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0)
        job.progress(percent)
      })
      .on('end', () => {
        resolve({
          outputPath,
          url: `/uploads/output/${path.basename(outputPath)}`
        })
      })
      .on('error', (err) => {
        reject(err)
      })
      .run()
  })
}

// 合并视频处理
async function processMerge(job: Job, processor: VideoProcessor): Promise<any> {
  const { fileIds } = job.data
  const outputPath = processor['getOutputPath']('mp4')

  // 创建临时文件列表
  const listPath = path.join(uploadDir, `${uuidv4()}.txt`)
  const fileList = fileIds.map((id: string) => {
    const filePath = processor['getFilePath'](id)
    return `file '${filePath}'`
  }).join('\n')

  fs.writeFileSync(listPath, fileList)

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions('-c copy')
      .output(outputPath)
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0)
        job.progress(percent)
      })
      .on('end', () => {
        // 清理临时文件
        fs.unlinkSync(listPath)
        resolve({
          outputPath,
          url: `/uploads/output/${path.basename(outputPath)}`
        })
      })
      .on('error', (err) => {
        // 清理临时文件
        if (fs.existsSync(listPath)) {
          fs.unlinkSync(listPath)
        }
        reject(err)
      })
      .run()
  })
}

// 添加水印处理
async function processWatermark(job: Job, processor: VideoProcessor): Promise<any> {
  const { fileId, text, position } = job.data
  const inputPath = processor['getFilePath'](fileId)
  const outputPath = processor['getOutputPath']('mp4')

  // 根据位置设置水印坐标
  const positions: Record<string, string> = {
    topleft: '10:10',
    topright: 'W-tw-10:10',
    bottomleft: '10:H-th-10',
    bottomright: 'W-tw-10:H-th-10'
  }

  const drawtext = `drawtext=text='${text}':fontsize=24:fontcolor=white:x=${positions[position] || positions.topright}`

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(drawtext)
      .output(outputPath)
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0)
        job.progress(percent)
      })
      .on('end', () => {
        resolve({
          outputPath,
          url: `/uploads/output/${path.basename(outputPath)}`
        })
      })
      .on('error', (err) => {
        reject(err)
      })
      .run()
  })
}

// 转码处理
async function processTranscode(job: Job, processor: VideoProcessor): Promise<any> {
  const { fileId, format, resolution } = job.data
  const inputPath = processor['getFilePath'](fileId)
  const outputPath = processor['getOutputPath'](format)

  let command = ffmpeg(inputPath)

  if (resolution) {
    command = command.size(resolution)
  }

  return new Promise((resolve, reject) => {
    command
      .output(outputPath)
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0)
        job.progress(percent)
      })
      .on('end', () => {
        resolve({
          outputPath,
          url: `/uploads/output/${path.basename(outputPath)}`
        })
      })
      .on('error', (err) => {
        reject(err)
      })
      .run()
  })
}

// 合成视频处理
async function processComposite(job: Job, processor: VideoProcessor): Promise<any> {
  const { trackInfo } = job.data
  if (!trackInfo) {
    throw new Error('缺少 trackInfo，无法执行合成')
  }
  const outputPath = processor['getOutputPath']('mp4')

  // 生成FFmpeg命令
  const command = generateCompositeCommand(trackInfo, outputPath)
  return new Promise((resolve, reject) => {
    command
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0)
        job.progress(percent)
      })
      .on('end', () => {
        resolve({
          outputPath,
          url: `/uploads/output/${path.basename(outputPath)}`
        })
      })
      .on('error', (err) => {
        reject(err)
      })
      .run()
  })
}


interface AudioSlot {
  sourceUrl: string
  startMs: number  // 在时间轴上的起始位置（ms）
  timelineDurationMs: number // 在时间轴上的持续时长（ms）
  fromMs: number   // 在源音频中的裁剪起点（ms）
  toMs: number     // 在源音频中的裁剪终点（ms）
  playRate: number // 播放倍率
  repeat: boolean  // 是否需要循环补齐
  volume: number   // 音量 0-1
  fadeIn: number   // 淡入时长（ms）
  fadeOut: number  // 淡出时长（ms）
}

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(3)
}

function itemInputIdx(item: IVideoTrackItem, map: Map<string, number>): number {
  const idx = map.get(item.id)
  if (idx === undefined) throw new Error(`Video item ${item.id} not found in input map`)
  return idx
}

function normalizeAudioSlots(trackInfo: ITrackInfo): AudioSlot[] {
  const slots: AudioSlot[] = []
  const audioTrackTypes = [MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.SOUND_AUDIO, MATERIAL_TYPE.ORAL_AUDIO]
  const audioTracks = trackInfo.tracks.filter(
    (track) => audioTrackTypes.includes(track.trackType as any) && !track.hide
  )

  audioTracks.forEach((track) => {
    track.children.forEach((item) => {
      const audioItem = item as IAudioTrackItem
      const volume = audioItem.volume ?? 1
      if (audioItem.muted || audioItem.hide || !audioItem.url || volume <= 0) return

      const playRate = Math.max(0.5, Math.min(2, audioItem.playRate ?? 1))
      const startMs = Math.max(0, audioItem.startTime)
      const endMs = Math.max(startMs, audioItem.endTime)
      const fromMs = Math.max(0, audioItem.fromTime ?? 0)
      const timelineDurationMs = endMs - startMs
      const sourceDurationMs = Math.max(1, (audioItem.toTime ?? (fromMs + timelineDurationMs)) - fromMs)
      const fadeMax = Math.floor(timelineDurationMs / 2)
      const outputDurationAfterRate = sourceDurationMs / playRate
      const repeat = outputDurationAfterRate < timelineDurationMs

      if (timelineDurationMs <= 0) return

      slots.push({
        sourceUrl: audioItem.url,
        startMs,
        timelineDurationMs,
        fromMs,
        toMs: fromMs + sourceDurationMs,
        playRate,
        repeat,
        volume,
        fadeIn: Math.min(audioItem.fadeIn ?? 0, fadeMax),
        fadeOut: Math.min(audioItem.fadeOut ?? 0, fadeMax),
      })
    })
  })

  return slots
}

// 生成合成命令
function generateCompositeCommand(trackInfo: ITrackInfo, outputPath: string): ffmpeg.FfmpegCommand {
  const width = Math.max(2, Math.floor(trackInfo.width || 1280))
  const height = Math.max(2, Math.floor(trackInfo.height || 720))
  const durationMs = Math.max(1, Math.floor(trackInfo.duration || 10000))
  const durationSec = msToSec(durationMs)
  const fps = Math.max(1, Math.floor(trackInfo.fps || 25))
  const audioSlots = normalizeAudioSlots(trackInfo)

  // Collect all video items per track (preserving track adjacency for transition detection)
  const videoTracks = trackInfo.tracks.filter(
    (t) => t.trackType === MATERIAL_TYPE.VIDEO && !t.hide
  )
  const allVideoItems: IVideoTrackItem[] = []
  videoTracks.forEach((track) => {
    const items = (track.children as IVideoTrackItem[]).filter((item) => !item.hide && !!item.url)
    allVideoItems.push(...items)
  })

  if (allVideoItems.length === 0) {
    throw new Error('当前未找到可导出的有效视频轨道片段')
  }

  // Build ffmpeg command: all video inputs first, then audio inputs
  let command = ffmpeg()
  allVideoItems.forEach((item) => { command = command.input(item.url!) })
  audioSlots.forEach((slot) => { command = command.input(slot.sourceUrl) })

  // Map each item to its ffmpeg input index
  const itemToInputIdx = new Map(allVideoItems.map((item, i) => [item.id, i]))

  const filters: string[] = []
  filters.push(`color=c=black:s=${width}x${height}:d=${durationSec}[base]`)

  const overlaySegments: { label: string; startMs: number }[] = []
  const consumed = new Set<string>() // item IDs already handled as part of a transition pair

  videoTracks.forEach((track) => {
    const items = (track.children as IVideoTrackItem[])
      .filter((item) => !item.hide && !!item.url)
      .sort((a, b) => a.startTime - b.startTime)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (consumed.has(item.id)) continue

      const iIdx = itemInputIdx(item, itemToInputIdx)
      const nextItem = i + 1 < items.length ? items[i + 1] : null
      const resolved = nextItem ? resolveTransitionBetweenItems(item, nextItem) : null

      if (resolved && nextItem && !consumed.has(nextItem.id)) {
        // ── Transition pair: blend filter approach ─────────────────────────
        //
        //  Strategy: split the clip pair into three timeline segments:
        //    1. clip1 pre-transition  (clip1 playing normally before the overlap window)
        //    2. blend segment         (FFmpeg `blend` merges clip1 tail + clip2 head
        //                              using the GLSL-equivalent per-pixel expression)
        //    3. clip2 post-transition (clip2 playing normally after the overlap window)
        //
        //  blend=all_expr directly returns pixel values from either A (outgoing)
        //  or B (incoming) — no alpha channel / no overlay alpha compositing needed,
        //  which makes this work reliably across all FFmpeg builds.

        const jIdx = itemInputIdx(nextItem, itemToInputIdx)

        const prevSrcStart  = item.fromTime / 1000
        const prevSrcEnd    = item.toTime   / 1000
        const prevTlStart   = item.startTime / 1000

        const nextSrcStart  = nextItem.fromTime / 1000
        const nextSrcEnd    = nextItem.toTime   / 1000

        const overlapStart  = nextItem.startTime / 1000   // = transition window start (timeline)
        const transitionDur = resolved.transition.duration / 1000
        const overlapEnd    = overlapStart + transitionDur

        const effectType    = getEffectType(resolved.transition.effectId)

        // Source offset into clip1 where the transition begins
        const prevTrSrcStart  = prevSrcStart + (overlapStart - prevTlStart)
        const prevTrSrcEnd    = Math.min(prevSrcEnd, prevTrSrcStart + transitionDur)
        const actualTrDur     = prevTrSrcEnd - prevTrSrcStart  // may be < transitionDur

        // ── 1. clip1 pre-transition (before the overlap) ─────────────────
        if (prevTrSrcStart > prevSrcStart) {
          const lblPre = `vp${iIdx}`
          filters.push(
            `[${iIdx}:v]trim=start=${prevSrcStart.toFixed(3)}:end=${prevTrSrcStart.toFixed(3)},` +
            `setpts=PTS-STARTPTS+${prevTlStart.toFixed(3)}/TB,` +
            `fps=${fps},scale=${width}:${height},setsar=1[${lblPre}]`
          )
          overlaySegments.push({ label: lblPre, startMs: item.startTime })
        }

        // ── 2. blend segment (both clips trimmed to [0, actualTrDur], PTS from 0) ──
        const lblTrA = `ta${iIdx}`
        const lblTrB = `tb${jIdx}`
        const lblTrOut = `tm${iIdx}`

        filters.push(
          `[${iIdx}:v]trim=start=${prevTrSrcStart.toFixed(3)}:end=${prevTrSrcEnd.toFixed(3)},` +
          `setpts=PTS-STARTPTS,fps=${fps},scale=${width}:${height},setsar=1[${lblTrA}]`
        )

        const nextTrSrcEnd = nextSrcStart + actualTrDur
        filters.push(
          `[${jIdx}:v]trim=start=${nextSrcStart.toFixed(3)}:end=${nextTrSrcEnd.toFixed(3)},` +
          `setpts=PTS-STARTPTS,fps=${fps},scale=${width}:${height},setsar=1[${lblTrB}]`
        )

        // In blend: T = PTS of first input (0 → actualTrDur), so progress = T / actualTrDur
        const progress  = `min(1,max(0,T/${actualTrDur.toFixed(3)}))`
        const blendExpr = buildBlendExpr(effectType, progress)
        filters.push(
          `[${lblTrA}][${lblTrB}]blend=all_expr='${blendExpr}',` +
          `setpts=PTS+${overlapStart.toFixed(3)}/TB[${lblTrOut}]`
        )
        overlaySegments.push({ label: lblTrOut, startMs: overlapStart * 1000 })

        // ── 3. clip2 post-transition (after the overlap) ──────────────────
        const nextPostSrcStart = nextSrcStart + actualTrDur
        if (nextPostSrcStart < nextSrcEnd) {
          const lblPost = `vq${jIdx}`
          filters.push(
            `[${jIdx}:v]trim=start=${nextPostSrcStart.toFixed(3)}:end=${nextSrcEnd.toFixed(3)},` +
            `setpts=PTS-STARTPTS+${overlapEnd.toFixed(3)}/TB,` +
            `fps=${fps},scale=${width}:${height},setsar=1[${lblPost}]`
          )
          overlaySegments.push({ label: lblPost, startMs: overlapEnd * 1000 })
        }

        consumed.add(nextItem.id)
      } else {
        // ── Standalone clip: plain trim + time-shift ───────────────────────
        const srcStart = item.fromTime / 1000
        const srcEnd   = item.toTime   / 1000
        const tlStart  = item.startTime / 1000
        const lblV     = `vs${iIdx}`

        filters.push(
          `[${iIdx}:v]trim=start=${srcStart.toFixed(3)}:end=${srcEnd.toFixed(3)},` +
          `setpts=PTS-STARTPTS+${tlStart.toFixed(3)}/TB,` +
          `fps=${fps},scale=${width}:${height},setsar=1[${lblV}]`
        )

        overlaySegments.push({ label: lblV, startMs: item.startTime })
      }
    }
  })

  // Sort segments by timeline start, then build the overlay chain.
  // All segments are plain YUV — blend outputs are already composited, no alpha needed.
  overlaySegments.sort((a, b) => a.startMs - b.startMs)
  let currentVideoLabel = '[base]'
  overlaySegments.forEach(({ label }, index) => {
    const nextLabel = index === overlaySegments.length - 1 ? '[vout]' : `[vo${index}]`
    filters.push(`${currentVideoLabel}[${label}]overlay=eof_action=pass:shortest=0${nextLabel}`)
    currentVideoLabel = nextLabel
  })

  // 处理背景音频轨道
  const videoInputCount = allVideoItems.length
  const audioOutLabels: string[] = []

  audioSlots.forEach((slot, i) => {
    const inputIndex = videoInputCount + i
    const label = `a${i}`
    const timelineDurationSec = (slot.timelineDurationMs / 1000)
    const segDurationSec = timelineDurationSec.toFixed(3)

    let filterChain = `[${inputIndex}:a]atrim=start=${msToSec(slot.fromMs)}:end=${msToSec(slot.toMs)}`

    if (slot.playRate !== 1) {
      filterChain += `,atempo=${slot.playRate.toFixed(3)}`
    }

    if (slot.repeat) {
      filterChain += `,aloop=loop=-1:size=2147483647`
    }

    filterChain += `,asetpts=PTS-STARTPTS`

    if (slot.volume !== 1) {
      filterChain += `,volume=${slot.volume}`
    }
    if (slot.fadeIn > 0) {
      filterChain += `,afade=t=in:st=0:d=${msToSec(slot.fadeIn)}`
    }
    if (slot.fadeOut > 0) {
      const fadeStart = Math.max(0, parseFloat(segDurationSec) - slot.fadeOut / 1000).toFixed(3)
      filterChain += `,afade=t=out:st=${fadeStart}:d=${msToSec(slot.fadeOut)}`
    }

    // 固定输出到时间轴区间长度，再延迟到 startMs
    filterChain += `,atrim=end=${segDurationSec},adelay=${slot.startMs}|${slot.startMs}[${label}]`

    filters.push(filterChain)
    audioOutLabels.push(`[${label}]`)
  })

  // 混音
  let hasAudio = false
  if (audioOutLabels.length === 1) {
    // 只有一路音频，直接重命名标签
    filters[filters.length - 1] = filters[filters.length - 1].replace(`[a0]`, '[aout]')
    audioOutLabels[0] = '[aout]'
    hasAudio = true
  } else if (audioOutLabels.length > 1) {
    filters.push(`${audioOutLabels.join('')}amix=inputs=${audioOutLabels.length}:duration=longest:normalize=0[aout]`)
    hasAudio = true
  }

  const outputOptions = [
    '-map', '[vout]',
    ...(hasAudio ? ['-map', '[aout]'] : []),
    '-t', durationSec,
    '-r', `${fps}`,
    '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-movflags', '+faststart',
    ...(hasAudio ? ['-c:a', 'aac', '-b:a', '192k'] : ['-an'])
  ]

  command = command.complexFilter(filters).output(outputPath).outputOptions(outputOptions)

  const filterStr = filters.join(';\n  ')
  console.log('[composite] complex filter:\n  ' + filterStr)

  command.on('start', (commandLine) => {
    console.log('[composite] ffmpeg command:', commandLine)
  })
  command.on('stderr', (line: string) => {
    // Only log actual errors, not the normal progress lines
    if (/Error|Invalid|Cannot|No such|failed|undefined/i.test(line)) {
      console.error('[composite] ffmpeg stderr:', line)
    }
  })

  return command
}

export const videoProcessor = new VideoProcessor()
