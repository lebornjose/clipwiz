import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { videoQueue } from './queue.js'
import type { Job } from 'bull'
import { ITrackInfo, MATERIAL_TYPE } from '@clipwiz/shared'

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
  const { operation, fileId, fileIds, trackInfo } = job.data
  const processor = new VideoProcessor()

  switch (operation) {
    case 'trim':
      return await processTrim(job, processor)
    case 'merge':
      return await processMerge(job, processor)
    case 'watermark':
      return await processWatermark(job, processor)
    case 'transcode':
      return await processTranscode(job, processor)
    case 'composite':
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

// 生成合成命令
function generateCompositeCommand(trackInfo: ITrackInfo, outputPath: string): ffmpeg.FfmpegCommand {
  const { width, height, duration, tracks } = trackInfo

  let command = ffmpeg()
  let hasVideo = false
  let hasAudio = false

  // 处理各个轨道
  tracks.forEach((track, trackIndex) => {
    if (track.hide) return

    switch (track.trackType) {
      case MATERIAL_TYPE.VIDEO:
        track.children.forEach((item: any, index: number) => {
          if (item.hide) return
          command = command.input(item.url)
          hasVideo = true
        })
        break
      case MATERIAL_TYPE.BGM_AUDIO:
        track.children.forEach((item: any, index: number) => {
          if (item.hide) return
          command = command.input(item.url)
          hasAudio = true
        })
        break
      case MATERIAL_TYPE.PHOTO:
        track.children.forEach((item: any, index: number) => {
          if (item.hide) return
          command = command.input(item.url)
          hasVideo = true
        })
        break
    }
  })

  // 设置输出参数
  command = command
    .output(outputPath)
    .outputOptions([
      `-t ${duration / 1000}`, // 转换为秒
      `-s ${width}x${height}`,
      `-c:v libx264`,
      `-preset medium`,
      `-crf 23`,
      `-c:a aac`,
      `-b:a 128k`,
      `-shortest`
    ])

  return command
}

// 处理视频轨道
function processVideoTrack(command: ffmpeg.FfmpegCommand, track: any, inputCount: number, videoStreams: string[], audioStreams: string[]): number {
  track.children.forEach((item: any, index: number) => {
    if (item.hide) return

    // 添加视频输入
    command = command.input(item.url)

    // 计算时间偏移（转换为秒）
    const fromTime = item.fromTime / 1000
    const toTime = item.toTime / 1000

    // 构建滤镜链
    const filterChain = []

    // 裁剪视频
    if (item.needCut) {
      filterChain.push(`[${inputCount}:v]trim=start=${fromTime}:end=${toTime},setpts=PTS-STARTPTS[vid${inputCount}]`)
      videoStreams.push(`[vid${inputCount}]`)
    } else {
      filterChain.push(`[${inputCount}:v]setpts=PTS-STARTPTS[vid${inputCount}]`)
      videoStreams.push(`[vid${inputCount}]`)
    }

    // 添加音频
    if (!item.muted && item.volume > 0) {
      filterChain.push(`[${inputCount}:a]volume=${item.volume},atrim=start=${fromTime}:end=${toTime},asetpts=PTS-STARTPTS[aud${inputCount}]`)
      audioStreams.push(`[aud${inputCount}]`)
    }

    // 应用滤镜
    if (filterChain.length > 0) {
      command = command.complexFilter(filterChain)
    }

    inputCount++
  })

  return inputCount
}

// 处理音频轨道
function processAudioTrack(command: ffmpeg.FfmpegCommand, track: any, inputCount: number, audioStreams: string[]): number {
  track.children.forEach((item: any, index: number) => {
    if (item.hide) return

    // 添加音频输入
    command = command.input(item.url)

    // 计算时间偏移（转换为秒）
    const duration = (item.endTime - item.startTime) / 1000
    const fromTime = item.fromTime / 1000
    const toTime = item.toTime / 1000

    // 构建滤镜链
    const filterChain = []

    // 处理音频
    let audioFilter = `[${inputCount}:a]`

    // 音量控制
    if (item.volume !== 1) {
      audioFilter += `volume=${item.volume},`
    }

    // 淡入淡出
    if (item.fadeIn) {
      audioFilter += `afade=t=in:st=0:d=${item.fadeIn / 1000},`
    }
    if (item.fadeOut) {
      audioFilter += `afade=t=out:st=${(duration - item.fadeOut) / 1000}:d=${item.fadeOut / 1000},`
    }

    // 裁剪音频
    audioFilter += `atrim=start=${fromTime}:end=${toTime},asetpts=PTS-STARTPTS[aud${inputCount}]`

    filterChain.push(audioFilter)
    audioStreams.push(`[aud${inputCount}]`)

    // 应用滤镜
    if (filterChain.length > 0) {
      command = command.complexFilter(filterChain)
    }

    inputCount++
  })

  return inputCount
}

// 处理图片轨道
function processPhotoTrack(command: ffmpeg.FfmpegCommand, track: any, inputCount: number, videoStreams: string[]): number {
  track.children.forEach((item: any, index: number) => {
    if (item.hide) return

    // 添加图片输入
    command = command.input(item.url)

    // 计算时间偏移（转换为秒）
    const duration = (item.endTime - item.startTime) / 1000

    // 构建滤镜链
    const filterChain = []

    // 处理图片
    filterChain.push(`[${inputCount}:v]scale=${item.width}:${item.height},loop=loop=-1:size=1:start=0,setpts=N/FRAME_RATE/TB,trim=duration=${duration}[img${inputCount}]`)
    videoStreams.push(`[img${inputCount}]`)

    // 应用滤镜
    if (filterChain.length > 0) {
      command = command.complexFilter(filterChain)
    }

    inputCount++
  })

  return inputCount
}

export const videoProcessor = new VideoProcessor()

