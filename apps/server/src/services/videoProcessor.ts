import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { videoQueue } from './queue.js'
import type { Job } from 'bull'
import {
  ITrackInfo, MATERIAL_TYPE,
  IVideoTrackItem, IAudioTrackItem, ISubtitleTrackItem,
} from '@clipwiz/shared'

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

interface VideoSlot {
  sourceUrl: string
  startMs: number
  endMs: number
  fromMs: number
  toMs: number
}

interface AudioSlot {
  sourceUrl: string
  startMs: number  // 在时间轴上的起始位置（ms）
  fromMs: number   // 在源音频中的裁剪起点（ms）
  toMs: number     // 在源音频中的裁剪终点（ms）
  volume: number   // 音量 0-1
  fadeIn: number   // 淡入时长（ms）
  fadeOut: number  // 淡出时长（ms）
}

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(3)
}

function normalizeVideoSlots(trackInfo: ITrackInfo): VideoSlot[] {
  const slots: VideoSlot[] = []
  const videoTracks = trackInfo.tracks.filter((track) => track.trackType === MATERIAL_TYPE.VIDEO && !track.hide)

  videoTracks.forEach((track) => {
    track.children.forEach((item) => {
      const videoItem = item as IVideoTrackItem
      if (videoItem.hide || !videoItem.url) return

      const slotStartMs = Math.max(0, videoItem.startTime)
      const slotEndMs = Math.max(slotStartMs, videoItem.endTime)
      const sourceFromMs = Math.max(0, videoItem.fromTime ?? 0)
      const sourceToMs = Math.max(sourceFromMs, videoItem.toTime ?? sourceFromMs + (slotEndMs - slotStartMs))
      const slotDurationMs = slotEndMs - slotStartMs
      const sourceDurationMs = sourceToMs - sourceFromMs
      const actualDurationMs = Math.min(slotDurationMs, sourceDurationMs)

      if (actualDurationMs <= 0) return

      slots.push({
        sourceUrl: videoItem.url,
        startMs: slotStartMs,
        endMs: slotStartMs + actualDurationMs,
        fromMs: sourceFromMs,
        toMs: sourceFromMs + actualDurationMs
      })
    })
  })

  return slots.sort((a, b) => a.startMs - b.startMs)
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
      if (audioItem.muted || audioItem.hide || !audioItem.url) return

      const startMs = Math.max(0, audioItem.startTime)
      const endMs = Math.max(startMs, audioItem.endTime)
      const fromMs = Math.max(0, audioItem.fromTime ?? 0)
      const slotDurationMs = endMs - startMs
      const sourceDurationMs = audioItem.toTime != null ? audioItem.toTime - fromMs : slotDurationMs
      const actualDurationMs = Math.min(slotDurationMs, sourceDurationMs)

      if (actualDurationMs <= 0) return

      slots.push({
        sourceUrl: audioItem.url,
        startMs,
        fromMs,
        toMs: fromMs + actualDurationMs,
        volume: audioItem.volume ?? 1,
        fadeIn: audioItem.fadeIn ?? 0,
        fadeOut: audioItem.fadeOut ?? 0,
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
  const videoSlots = normalizeVideoSlots(trackInfo)
  const audioSlots = normalizeAudioSlots(trackInfo)

  if (videoSlots.length === 0) {
    throw new Error('当前未找到可导出的有效视频轨道片段')
  }

  let command = ffmpeg()
  videoSlots.forEach((slot) => {
    command = command.input(slot.sourceUrl)
  })
  // 添加音频输入（视频输入之后）
  audioSlots.forEach((slot) => {
    command = command.input(slot.sourceUrl)
  })

  const filters: string[] = []
  filters.push(`color=c=black:s=${width}x${height}:d=${durationSec}[base]`)

  videoSlots.forEach((slot, inputIndex) => {
    filters.push(
      `[${inputIndex}:v]trim=start=${msToSec(slot.fromMs)}:end=${msToSec(slot.toMs)},` +
      `setpts=PTS-STARTPTS+${msToSec(slot.startMs)}/TB,scale=${width}:${height},setsar=1[v${inputIndex}]`
    )
  })

  let currentVideoLabel = '[base]'
  videoSlots.forEach((_, index) => {
    const nextLabel = index === videoSlots.length - 1 ? '[vout]' : `[vo${index}]`
    filters.push(`${currentVideoLabel}[v${index}]overlay=eof_action=pass:shortest=0${nextLabel}`)
    currentVideoLabel = nextLabel
  })

  // 处理背景音频轨道
  const videoInputCount = videoSlots.length
  const audioOutLabels: string[] = []

  audioSlots.forEach((slot, i) => {
    const inputIndex = videoInputCount + i
    const label = `a${i}`
    const segDurationSec = ((slot.toMs - slot.fromMs) / 1000).toFixed(3)

    let filterChain = `[${inputIndex}:a]atrim=start=${msToSec(slot.fromMs)}:end=${msToSec(slot.toMs)},asetpts=PTS-STARTPTS`

    if (slot.volume !== 1) {
      filterChain += `,volume=${slot.volume}`
    }
    if (slot.fadeIn > 0) {
      filterChain += `,afade=t=in:st=0:d=${msToSec(slot.fadeIn)}`
    }
    if (slot.fadeOut > 0) {
      const fadeStart = (parseFloat(segDurationSec) - slot.fadeOut / 1000).toFixed(3)
      filterChain += `,afade=t=out:st=${fadeStart}:d=${msToSec(slot.fadeOut)}`
    }

    // adelay 单位是毫秒，支持多声道
    filterChain += `,adelay=${slot.startMs}|${slot.startMs}[${label}]`

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

  command = command.complexFilter(filters)

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

  command = command.output(outputPath).outputOptions(outputOptions)

  command.on('start', (commandLine) => {
    console.log('FFmpeg 命令:', commandLine)
  })

  return command
}

export const videoProcessor = new VideoProcessor()
