import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import { Audio } from '../models/Audio.js'
import { uploadToOSS, deleteFromOSS } from '../services/ossService.js'

const router = Router()

const tmpDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpDir),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
})

const AUDIO_EXTS = /\.(mp3|wav|aac|ogg|flac|m4a|wma|MP3|WAV|AAC)$/i

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '100000000') },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    if (AUDIO_EXTS.test(ext)) return cb(null, true)
    cb(new Error('不支持的文件格式，仅支持音频文件'))
  },
})

function probeAudio(filePath: string): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, meta) => {
      if (err) return reject(err)
      const duration = Math.round((meta.format.duration ?? 0) * 1000)
      resolve({ duration })
    })
  })
}

// GET /api/audio?page=1&limit=20 - list audios with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit
    const [audios, total] = await Promise.all([
      Audio.find().sort({ source: 1, createdAt: -1 }).skip(skip).limit(limit),
      Audio.countDocuments(),
    ])
    res.json({ code: 200, data: audios, total, page, limit })
  } catch (err) {
    next(err)
  }
})

// POST /api/audio/seed - seed preset audio data (idempotent)
router.post('/seed', async (_req, res, next) => {
  const presets = [
    { name: '鞋子磨擦地音效一下', duration: 0, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E9%9E%8B%E5%AD%90%E7%A3%A8%E6%93%A6%E5%9C%B0%E9%9F%B3%E6%95%88%E4%B8%80%E4%B8%8B.MP3' },
    { name: '鞋子磨擦地音效X2下', duration: 0, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E6%89%8B%E6%91%B8%E9%9E%8B%E5%AD%90%E9%9F%B3%E6%95%88-%E5%90%88%E9%80%82%E7%9A%84%E5%9C%B0%E6%96%B9%E7%94%A8.MP3' },
    { name: '手摸鞋子音效', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_e5ef2237b42b51f5edd7e197c78acd29/%E7%A4%BC%E7%82%AE%E7%9A%84%E9%9F%B3%E6%95%88.MP3' },
    { name: '秋冬款鞋子音效', duration: 0, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E9%9E%8B%E5%AD%90%E7%A3%A8%E6%93%A6%E5%9C%B0%E9%9F%B3%E6%95%88%E4%B8%80%E4%B8%8B.MP3' },
    { name: '【动作】跑冰砰水', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E6%89%8B%E6%91%B8%E9%9E%8B%E5%AD%90%E9%9F%B3%E6%95%88-%E5%90%88%E9%80%82%E7%9A%84%E5%9C%B0%E6%96%B9%E7%94%A8.MP3' },
    { name: '礼炮鞋底声音', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_e5ef2237b42b51f5edd7e197c78acd29/%E7%A4%BC%E7%82%AE%E7%9A%84%E9%9F%B3%E6%95%88.MP3' },
    { name: '容题正确提示', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E9%9E%8B%E5%AD%90%E7%A3%A8%E6%93%A6%E5%9C%B0%E9%9F%B3%E6%95%88%E4%B8%80%E4%B8%8B.MP3' },
    { name: '喵影效呼声', duration: 2000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E6%89%8B%E6%91%B8%E9%9E%8B%E5%AD%90%E9%9F%B3%E6%95%88-%E5%90%88%E9%80%82%E7%9A%84%E5%9C%B0%E6%96%B9%E7%94%A8.MP3' },
    { name: '胶片滚动声', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_e5ef2237b42b51f5edd7e197c78acd29/%E7%A4%BC%E7%82%AE%E7%9A%84%E9%9F%B3%E6%95%88.MP3' },
    { name: '扣留必是一下音效', duration: 0, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E9%9E%8B%E5%AD%90%E7%A3%A8%E6%93%A6%E5%9C%B0%E9%9F%B3%E6%95%88%E4%B8%80%E4%B8%8B.MP3' },
    { name: '苏水原声', duration: 2000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E6%89%8B%E6%91%B8%E9%9E%8B%E5%AD%90%E9%9F%B3%E6%95%88-%E5%90%88%E9%80%82%E7%9A%84%E5%9C%B0%E6%96%B9%E7%94%A8.MP3' },
    { name: '鞋子磨擦声', duration: 0, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_e5ef2237b42b51f5edd7e197c78acd29/%E7%A4%BC%E7%82%AE%E7%9A%84%E9%9F%B3%E6%95%88.MP3' },
    { name: '扣留必是', duration: 2000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E9%9E%8B%E5%AD%90%E7%A3%A8%E6%93%A6%E5%9C%B0%E9%9F%B3%E6%95%88%E4%B8%80%E4%B8%8B.MP3' },
    { name: '叮2', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E6%89%8B%E6%91%B8%E9%9E%8B%E5%AD%90%E9%9F%B3%E6%95%88-%E5%90%88%E9%80%82%E7%9A%84%E5%9C%B0%E6%96%B9%E7%94%A8.MP3' },
    { name: '滑稽综艺音效 呦啊', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_e5ef2237b42b51f5edd7e197c78acd29/%E7%A4%BC%E7%82%AE%E7%9A%84%E9%9F%B3%E6%95%88.MP3' },
    { name: '卡通叮叮声', duration: 1000, url: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_bbf7de6f3a9c8e7545112c4f3dd267ab/%E9%9E%8B%E5%AD%90%E7%A3%A8%E6%93%A6%E5%9C%B0%E9%9F%B3%E6%95%88%E4%B8%80%E4%B8%8B.MP3' },
  ]

  try {
    const existingCount = await Audio.countDocuments({ source: 'preset' })
    if (existingCount > 0) {
      return res.json({ code: 200, message: '预设音频已存在，跳过', count: existingCount })
    }
    const docs = presets.map((p) => ({ ...p, source: 'preset' as const, size: 0 }))
    const inserted = await Audio.insertMany(docs)
    res.json({ code: 200, message: '预设音频入库成功', count: inserted.length })
  } catch (err) {
    next(err)
  }
})

// POST /api/audio/upload
router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '没有上传文件' })

  const localPath = req.file.path
  const ossKey = `audios/${req.file.filename}`

  try {
    const url = await uploadToOSS(localPath, ossKey)

    let duration: number | undefined
    try {
      const meta = await probeAudio(localPath)
      duration = meta.duration
    } catch {
      // best-effort
    }

    const audio = await Audio.create({
      name: req.file.originalname.replace(/\.[^/.]+$/, ''),
      url,
      ossKey,
      duration,
      size: req.file.size,
      source: 'user',
    })

    res.json({ code: 200, data: audio })
  } catch (err) {
    next(err)
  } finally {
    fs.unlink(localPath, () => {})
  }
})

// DELETE /api/audio/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const audio = await Audio.findByIdAndDelete(req.params.id)
    if (!audio) return res.status(404).json({ code: 404, message: '音频不存在' })
    if (audio.source === 'user' && audio.ossKey) {
      deleteFromOSS(audio.ossKey).catch(() => {})
    }
    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

export { router as audioRouter }
