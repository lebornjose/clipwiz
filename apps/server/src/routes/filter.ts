import { Router } from 'express'
import { Filter } from '../models/Filter.js'

const router = Router()

// GET /api/filter?page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit
    const [filters, total] = await Promise.all([
      Filter.find().sort({ createdAt: 1 }).skip(skip).limit(limit),
      Filter.countDocuments(),
    ])
    res.json({ code: 200, data: filters, total, page, limit })
  } catch (err) {
    next(err)
  }
})

// POST /api/filter/seed - idempotent preset seeding
router.post('/seed', async (_req, res, next) => {
  const presets = [
    {
      elementId: '2501410173357019',
      name: '鲜明II',
      coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/screenshot-20241011-104947.png',
      cubeUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/Abee%2003_S.cube',
      elementCode: '98d088d6393ddad9b7d60ec859908b8d',
      tags: ['美食'],
    },
    {
      elementId: '2501410173355029',
      name: '鲜明I',
      coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/screenshot-20241011-104947.png',
      cubeUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/Abee%2003.cube',
      elementCode: '0d2e1a8e43e7a3c4713f4112189eae35',
      tags: ['基础', '美食'],
    },
    {
      elementId: '2501410173356015',
      name: '质感II',
      coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/screenshot-20241011-104947.png',
      cubeUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/Abee%2002_S.cube',
      elementCode: 'bfbac64cd562564b165ee008e4adf110',
      tags: ['美食', '户外'],
    },
    {
      elementId: '2501410173355015',
      name: '质感I',
      coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/screenshot-20241011-104947.png',
      cubeUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/Abee%2002.cube',
      elementCode: 'c64dc2a41e35d5e29e0d5ecfb1ff725c',
      tags: ['户外'],
    },
    {
      elementId: '2501410173354020',
      name: '电影II',
      coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/screenshot-20241011-104947.png',
      cubeUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/%E6%BB%A4%E9%95%9C/Mapova%2003_S.cube',
      elementCode: '4e205673cad14fbc9343cb73bcc2e18c',
      tags: ['风景'],
    },
  ]

  try {
    const existingCount = await Filter.countDocuments()
    if (existingCount > 0) {
      return res.json({ code: 200, message: '滤镜已存在，跳过', count: existingCount })
    }
    const inserted = await Filter.insertMany(presets)
    res.json({ code: 200, message: '滤镜入库成功', count: inserted.length })
  } catch (err) {
    next(err)
  }
})

export { router as filterRouter }
