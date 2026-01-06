import { Router } from 'express'
import { videoQueue } from '../services/queue.js'

const router = Router()

// 获取任务状态
router.get('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params
    const job = await videoQueue.getJob(jobId)

    if (!job) {
      return res.status(404).json({ error: '任务不存在' })
    }

    const state = await job.getState()
    const progress = job.progress()
    const result = job.returnvalue

    res.json({
      id: job.id,
      state,
      progress,
      result,
      data: job.data
    })
  } catch (error) {
    next(error)
  }
})

// 获取所有任务列表
router.get('/', async (req, res, next) => {
  try {
    const jobs = await videoQueue.getJobs(['active', 'waiting', 'completed', 'failed'])
    
    const jobInfos = await Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        state: await job.getState(),
        progress: job.progress(),
        data: job.data,
        timestamp: job.timestamp
      }))
    )

    res.json(jobInfos)
  } catch (error) {
    next(error)
  }
})

// 取消任务
router.delete('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params
    const job = await videoQueue.getJob(jobId)

    if (!job) {
      return res.status(404).json({ error: '任务不存在' })
    }

    await job.remove()
    res.json({ message: '任务已取消' })
  } catch (error) {
    next(error)
  }
})

export { router as jobRouter }

