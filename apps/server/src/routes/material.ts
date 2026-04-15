import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import { Material } from '../models/Material.js'
import { uploadToOSS, deleteFromOSS } from '../services/ossService.js'

const router = Router()

// Temp storage before OSS upload
const tmpDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpDir),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
})

const VIDEO_EXTS = /\.(mp4|mov|avi|mkv|webm|flv)$/i
const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp)$/i

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '500000000') },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    if (VIDEO_EXTS.test(ext) || IMAGE_EXTS.test(ext)) return cb(null, true)
    cb(new Error('不支持的文件格式，仅支持视频和图片'))
  },
})

function probeVideo(filePath: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, meta) => {
      if (err) return reject(err)
      const vs = meta.streams.find((s) => s.codec_type === 'video')
      const duration = Math.round((meta.format.duration ?? 0) * 1000)
      resolve({ duration, width: vs?.width ?? 0, height: vs?.height ?? 0 })
    })
  })
}


// POST /api/material/upload
router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '没有上传文件' })

  const localPath = req.file.path
  const ext = path.extname(req.file.originalname).toLowerCase()
  const isVideo = VIDEO_EXTS.test(ext)
  const ossKey = `materials/${req.file.filename}`

  try {
    // 1. Upload original file to OSS
    const url = await uploadToOSS(localPath, ossKey)

    // 2. Extract video metadata
    let duration: number | undefined
    let width: number | undefined
    let height: number | undefined

    if (isVideo) {
      try {
        const meta = await probeVideo(localPath)
        duration = meta.duration
        width = meta.width
        height = meta.height
      } catch {
        // best-effort
      }
    }

    // 3. Save to MongoDB
    const material = await Material.create({
      name: req.file.originalname,
      url,
      ossKey,
      type: isVideo ? 'video' : 'image',
      duration,
      width,
      height,
      size: req.file.size,
    })

    res.json({ code: 200, data: material })
  } catch (err) {
    next(err)
  } finally {
    // Always remove temp file
    fs.unlink(localPath, () => {})
  }
})

// GET /api/material?page=1&limit=20 - list materials with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit
    const [materials, total] = await Promise.all([
      Material.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Material.countDocuments(),
    ])
    res.json({ code: 200, data: materials, total, page, limit })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/material/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id)
    if (!material) return res.status(404).json({ code: 404, message: '素材不存在' })
    deleteFromOSS(material.ossKey).catch(() => {})
    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

export { router as materialRouter }
