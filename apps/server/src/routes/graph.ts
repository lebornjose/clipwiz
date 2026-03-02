import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { processVideoJob } from '../services/videoProcessor.js'
import trackInfo from '../services/mock.js'
import type { ITrackInfo } from '@clipwiz/shared'

const router = Router()
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
const outputDir = path.resolve(uploadDir, 'output')

function isTrackInfoLike(value: unknown): value is ITrackInfo {
  if (!value || typeof value !== 'object') return false
  const obj = value as Partial<ITrackInfo>
  return typeof obj.width === 'number'
    && typeof obj.height === 'number'
    && typeof obj.duration === 'number'
    && Array.isArray(obj.tracks)
}

// 合成视频
router.post('/', async (req, res, next) => {
  try {
    const requestTrackInfo = req.body?.trackInfo ?? req.body
    const finalTrackInfo = isTrackInfoLike(requestTrackInfo) ? requestTrackInfo : trackInfo

    const result = await processVideoJob({
      data: {
        operation: 'composite',
        trackInfo: finalTrackInfo
      },
      progress: (percent: number) => {
        console.log(`合成进度: ${percent}%`)
      },
      id: 'test-job'
    } as any)

    const outputFilename = result?.outputPath ? path.basename(result.outputPath) : undefined
    const downloadUrl = outputFilename ? `/api/graph/download/${encodeURIComponent(outputFilename)}` : undefined

    res.json({
      message: '合成任务已完成',
      code: 200,
      data: {
        ...result,
        downloadUrl
      },
    })
  } catch (error) {
    console.error('合成视频请求失败:', error)
    next(error)
  }
})

router.get('/download/:filename', (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename || '')
  const filename = path.basename(decodedFilename)
  if (!filename) {
    return res.status(400).json({ error: '文件名不能为空' })
  }
  const filePath = path.resolve(outputDir, filename)

  if (!filePath.startsWith(outputDir + path.sep)) {
    return res.status(400).json({ error: '非法文件路径' })
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' })
  }

  return res.download(filePath, filename)
})

export { router as graphRouter }
