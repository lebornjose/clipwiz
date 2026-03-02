import Queue from 'bull'
import { processVideoJob } from './videoProcessor.js'

// 强制使用内存队列
const videoQueue = new Queue('video-processing', {
  redis: false // 使用内存队列
})

console.log('Using memory queue for job processing')

// 处理视频任务
videoQueue.process(async (job) => {
  console.log(`Processing job ${job.id}: ${job.data.operation}`)

  try {
    const result = await processVideoJob(job)
    return result
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error)
    throw error
  }
})

// 任务完成事件
videoQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result)
})

// 任务失败事件
videoQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message)
})

// 任务进度事件
videoQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`)
})

export { videoQueue }
export default videoQueue

