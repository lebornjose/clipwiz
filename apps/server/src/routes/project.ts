import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Project } from '../models/Project.js'
import { deleteFromOSS, uploadToOSS } from '../services/ossService.js'

const router = Router()
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'tmp')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const coverUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname) || '.png'}`),
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '500000000'),
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
      return
    }
    cb(new Error('只支持图片封面上传'))
  },
})

// 获取所有项目
router.get('/', async (_req, res, next) => {
  try {
    const projects = await Project.find({}, 'title coverUrl createdAt updatedAt').sort({ updatedAt: -1 })
    res.json({ code: 200, data: projects })
  } catch (error) {
    next(error)
  }
})

// 获取单个项目
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ code: 404, message: '项目不存在' })
    res.json({ code: 200, data: project })
  } catch (error) {
    next(error)
  }
})

// 创建项目
router.post('/', async (req, res, next) => {
  try {
    const { title, protocol, coverUrl } = req.body
    if (!title) return res.status(400).json({ code: 400, message: '缺少必要参数: title' })
    if (!protocol) return res.status(400).json({ code: 400, message: '缺少必要参数: protocol' })
    const project = await Project.create({ title, protocol, coverUrl })
    res.json({ code: 200, data: project })
  } catch (error) {
    next(error)
  }
})

// 更新项目
router.put('/:id', async (req, res, next) => {
  try {
    const { title, protocol, coverUrl, coverOssKey } = req.body
    const update: Record<string, unknown> = {}
    if (title !== undefined) update.title = title
    if (protocol !== undefined) update.protocol = protocol
    if (coverUrl !== undefined) update.coverUrl = coverUrl
    if (coverOssKey !== undefined) update.coverOssKey = coverOssKey
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!project) return res.status(404).json({ code: 404, message: '项目不存在' })
    res.json({ code: 200, data: project })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/cover', coverUpload.single('file'), async (req, res, next) => {
  const tempPath = req.file?.path

  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      if (tempPath) fs.promises.unlink(tempPath).catch(() => {})
      return res.status(404).json({ code: 404, message: '项目不存在' })
    }
    if (!req.file) return res.status(400).json({ code: 400, message: '没有上传封面文件' })

    const ext = path.extname(req.file.originalname) || '.png'
    const ossKey = `project-covers/${project._id}/${Date.now()}-${uuidv4()}${ext}`
    const coverUrl = await uploadToOSS(req.file.path, ossKey)

    if (project.coverOssKey) {
      deleteFromOSS(project.coverOssKey).catch(() => {})
    }

    project.coverUrl = coverUrl
    project.coverOssKey = ossKey
    await project.save()

    res.json({
      code: 200,
      data: {
        coverUrl,
        coverOssKey: ossKey,
      },
    })
  } catch (error) {
    next(error)
  } finally {
    if (tempPath) {
      fs.promises.unlink(tempPath).catch(() => {})
    }
  }
})

// 删除项目
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ code: 404, message: '项目不存在' })
    if (project.coverOssKey) {
      deleteFromOSS(project.coverOssKey).catch(() => {})
    }
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    next(error)
  }
})

export { router as projectRouter }
