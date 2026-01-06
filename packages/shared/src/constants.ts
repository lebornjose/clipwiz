// API 端点常量
export const API_ENDPOINTS = {
  UPLOAD: '/api/upload',
  UPLOAD_MULTIPLE: '/api/upload/multiple',
  VIDEO_INFO: '/api/video/info',
  VIDEO_TRIM: '/api/video/trim',
  VIDEO_MERGE: '/api/video/merge',
  VIDEO_WATERMARK: '/api/video/watermark',
  VIDEO_TRANSCODE: '/api/video/transcode',
  JOB_STATUS: '/api/job',
  JOB_LIST: '/api/job',
  JOB_CANCEL: '/api/job'
} as const

// 视频分辨率预设
export const VIDEO_RESOLUTIONS = {
  SD: '640x480',
  HD: '1280x720',
  FULL_HD: '1920x1080',
  '2K': '2560x1440',
  '4K': '3840x2160'
} as const

// 视频格式
export const VIDEO_FORMATS = {
  MP4: 'mp4',
  WEBM: 'webm',
  AVI: 'avi',
  MOV: 'mov',
  MKV: 'mkv'
} as const

// 视频帧率预设
export const VIDEO_FPS = {
  CINEMA: 24,
  PAL: 25,
  NTSC: 30,
  HIGH: 60
} as const

// 最大文件大小（字节）
export const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// 支持的视频格式
export const SUPPORTED_VIDEO_FORMATS = [
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v'
] as const

// 支持的音频格式
export const SUPPORTED_AUDIO_FORMATS = [
  'mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'
] as const

// 水印位置
export const WATERMARK_POSITIONS = {
  TOP_LEFT: 'topleft',
  TOP_RIGHT: 'topright',
  BOTTOM_LEFT: 'bottomleft',
  BOTTOM_RIGHT: 'bottomright',
  CENTER: 'center'
} as const

// 任务轮询间隔（毫秒）
export const JOB_POLLING_INTERVAL = 1000

// 任务超时时间（毫秒）
export const JOB_TIMEOUT = 300000 // 5分钟

