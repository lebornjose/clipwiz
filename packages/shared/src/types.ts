// 视频操作类型
export enum VideoOperation {
  TRIM = 'trim',
  MERGE = 'merge',
  WATERMARK = 'watermark',
  TRANSCODE = 'transcode',
  CROP = 'crop',
  ROTATE = 'rotate',
  SPEED = 'speed'
}

// 任务状态
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused'
}

// 视频信息接口
export interface VideoInfo {
  duration: number
  width: number
  height: number
  format: string
  bitrate: number
  fps?: number
  codec?: string
}

// 文件信息接口
export interface FileInfo {
  id: string
  filename: string
  originalname: string
  size: number
  path: string
  url: string
}

// 任务数据接口
export interface JobData {
  operation: VideoOperation
  fileId?: string
  fileIds?: string[]
  startTime?: number
  endTime?: number
  text?: string
  position?: string
  format?: string
  resolution?: string
  [key: string]: any
}

// 任务结果接口
export interface JobResult {
  outputPath: string
  url: string
  fileInfo?: FileInfo
}

// 任务信息接口
export interface JobInfo {
  id: string
  state: JobStatus
  progress: number
  data: JobData
  result?: JobResult
  timestamp?: number
  error?: string
}

// 上传配置接口
export interface UploadConfig {
  maxFileSize: number
  allowedFormats: string[]
  uploadDir: string
}

// API 响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 时间轴项接口
export interface TimelineItem {
  id: string
  type: 'video' | 'audio' | 'text' | 'image'
  fileId?: string
  startTime: number
  endTime: number
  track: number
  properties?: Record<string, any>
}

// 项目配置接口
export interface ProjectConfig {
  id: string
  name: string
  width: number
  height: number
  fps: number
  duration: number
  timeline: TimelineItem[]
  createdAt: Date
  updatedAt: Date
}

