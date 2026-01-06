/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化时间（秒）为 HH:MM:SS
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) parts.push(hours.toString().padStart(2, '0'))
  parts.push(minutes.toString().padStart(2, '0'))
  parts.push(secs.toString().padStart(2, '0'))

  return parts.join(':')
}

/**
 * 解析时间字符串为秒
 * @param timeString 时间字符串 (HH:MM:SS 或 MM:SS)
 * @returns 秒数
 */
export function parseDuration(timeString: string): number {
  const parts = timeString.split(':').map(Number)

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 1) {
    // SS
    return parts[0]
  }

  return 0
}

/**
 * 生成唯一ID
 * @returns UUID v4 字符串
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 延迟函数
 * @param ms 毫秒数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 验证视频格式
 * @param filename 文件名
 * @returns 是否为支持的视频格式
 */
export function isValidVideoFormat(filename: string): boolean {
  const validFormats = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.m4v']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return validFormats.includes(ext)
}

/**
 * 验证音频格式
 * @param filename 文件名
 * @returns 是否为支持的音频格式
 */
export function isValidAudioFormat(filename: string): boolean {
  const validFormats = ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return validFormats.includes(ext)
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名（不含点）
 */
export function getFileExtension(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.') + 1)
  return ext.toLowerCase()
}

/**
 * 计算百分比
 * @param current 当前值
 * @param total 总值
 * @returns 百分比（0-100）
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

