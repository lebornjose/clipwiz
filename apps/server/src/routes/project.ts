import { Router } from 'express'
import { Project } from '../models/Project.js'

const router = Router()

// 获取所有项目
router.get('/', async (_req, res, next) => {
  try {
    const projects = await Project.find({}, 'title createdAt updatedAt').sort({ updatedAt: -1 })
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
    const { title, protocol } = req.body
    if (!title) return res.status(400).json({ code: 400, message: '缺少必要参数: title' })
    if (!protocol) return res.status(400).json({ code: 400, message: '缺少必要参数: protocol' })
    const project = await Project.create({ title, protocol })
    res.json({ code: 200, data: project })
  } catch (error) {
    next(error)
  }
})

// 更新项目
router.put('/:id', async (req, res, next) => {
  try {
    const { title, protocol } = req.body
    const update: Record<string, unknown> = {}
    if (title !== undefined) update.title = title
    if (protocol !== undefined) update.protocol = protocol
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!project) return res.status(404).json({ code: 404, message: '项目不存在' })
    res.json({ code: 200, data: project })
  } catch (error) {
    next(error)
  }
})

// 删除项目
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ code: 404, message: '项目不存在' })
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    next(error)
  }
})

export { router as projectRouter }
