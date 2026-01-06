import { Router } from 'express'
import { videoProcessor } from '../services/videoProcessor.js'

const router = Router()

// 获取视频信息
router.get('/info/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params
    const info = await videoProcessor.getVideoInfo(fileId)
    res.json(info)
  } catch (error) {
    next(error)
  }
})

// 裁剪视频
router.post('/trim', async (req, res, next) => {
  try {
    const { fileId, startTime, endTime } = req.body
    
    if (!fileId || startTime === undefined || endTime === undefined) {
      return res.status(400).json({ error: '缺少必要参数: fileId, startTime, endTime' })
    }

    const job = await videoProcessor.trimVideo(fileId, startTime, endTime)
    res.json({ jobId: job.id, message: '视频裁剪任务已创建' })
  } catch (error) {
    next(error)
  }
})

// 合并视频
router.post('/merge', async (req, res, next) => {
  try {
    const { fileIds } = req.body
    
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: '请提供要合并的视频文件ID数组' })
    }

    const job = await videoProcessor.mergeVideos(fileIds)
    res.json({ jobId: job.id, message: '视频合并任务已创建' })
  } catch (error) {
    next(error)
  }
})

// 添加水印
router.post('/watermark', async (req, res, next) => {
  try {
    const { fileId, text, position } = req.body
    
    if (!fileId || !text) {
      return res.status(400).json({ error: '缺少必要参数: fileId, text' })
    }

    const job = await videoProcessor.addWatermark(fileId, text, position)
    res.json({ jobId: job.id, message: '添加水印任务已创建' })
  } catch (error) {
    next(error)
  }
})

// 视频转码
router.post('/transcode', async (req, res, next) => {
  try {
    const { fileId, format, resolution } = req.body
    
    if (!fileId || !format) {
      return res.status(400).json({ error: '缺少必要参数: fileId, format' })
    }

    const job = await videoProcessor.transcodeVideo(fileId, format, resolution)
    res.json({ jobId: job.id, message: '视频转码任务已创建' })
  } catch (error) {
    next(error)
  }
})

export { router as videoRouter }

