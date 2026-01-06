import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const router = Router()

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '500000000') // 500MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm|flv/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error('只支持视频文件格式: mp4, mov, avi, mkv, webm, flv'))
    }
  }
})

// 上传单个视频文件
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传文件' })
  }

  res.json({
    message: '文件上传成功',
    file: {
      id: path.parse(req.file.filename).name,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    }
  })
})

// 上传多个视频文件
router.post('/multiple', upload.array('files', 10), (req, res) => {
  const files = req.files as Express.Multer.File[]
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: '没有上传文件' })
  }

  const fileInfos = files.map(file => ({
    id: path.parse(file.filename).name,
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    path: file.path,
    url: `/uploads/${file.filename}`
  }))

  res.json({
    message: '文件上传成功',
    files: fileInfos
  })
})

export { router as uploadRouter }

