import { Router } from 'express'
import { processVideoJob } from '../services/videoProcessor.js'
import trackInfo from '../services/mock.js'

const router = Router()

// 合成视频
router.post('/', async (req, res, next) => {
  console.log('接收到合成视频请求')
  try {
    // 使用mock数据
    const mockTrackInfo = trackInfo
    console.log('准备处理合成任务')

    // 直接调用处理函数
    const result = await processVideoJob({
      data: {
        operation: 'composite',
        trackInfo: mockTrackInfo
      },
      progress: (percent: number) => {
        console.log(`合成进度: ${percent}%`)
      },
      id: 'test-job'
    } as any)

    console.log('合成任务已完成，结果:', result)
    res.json({
      message: '合成任务已完成',
      result: result,
      trackInfo: mockTrackInfo
    })
  } catch (error) {
    console.error('合成视频请求失败:', error)
    next(error)
  }
})

export { router as graphRouter }
