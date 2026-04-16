import { Router } from 'express'
import { Transition } from '../models/Transition.js'

const router = Router()

// GET /api/transition?page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit
    const [transitions, total] = await Promise.all([
      Transition.find().sort({ createdAt: 1 }).skip(skip).limit(limit),
      Transition.countDocuments(),
    ])
    res.json({ code: 200, data: transitions, total, page, limit })
  } catch (err) {
    next(err)
  }
})

// POST /api/transition/seed - idempotent preset seeding
router.post('/seed', async (_req, res, next) => {
  const presets = [
    {
      elementId: '2501506174116073',
      elementCode: 'left',
      elementName: '向左',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/left/resources/coverimage.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/left/resources/preview.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/left/transition.json',
      },
    },
    {
      elementId: '2501506174116080',
      elementCode: 'right',
      elementName: '向右',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/right/resources/coverimage.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/right/resources/preview.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/right/transition.json',
      },
    },
    {
      elementId: '2501506174116090',
      elementCode: 'pushClose',
      elementName: '推近1',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/push_close/cover.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/push_close/output.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/push_close/transition.json',
      },
    },
    {
      elementId: '2501506174116101',
      elementCode: 'pushAway',
      elementName: '拉远1',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/pull_away/cover.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/pull_away/output.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/pull_away/transition.json',
      },
    },
    {
      elementId: '2501506174116116',
      elementCode: 'fadeio',
      elementName: '叠化1',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/fadeio/cover.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/fadeio/output.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/fadeio/transition.json',
      },
    },
    {
      elementId: '2501506174116125',
      elementCode: 'leftSlide',
      elementName: '左移',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/left_slide/cover.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/left_slide/output.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/left_slide/transition.json',
      },
    },
    {
      elementId: '2501506174116139',
      elementCode: 'floodLight',
      elementName: '泛光',
      coverImgPath: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/flood_light/cover.jpg',
      originalUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/flood_light/output.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {
        uniformUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/resources/emptyUniformList.json',
        url: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/common_transition_resources/release/flood_light/transition.json',
      },
    },
    {
      elementId: '250130615241016',
      elementCode: 'push',
      elementName: '拉远',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-17.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {},
    },
    {
      elementId: '250130615241023',
      elementCode: 'pull',
      elementName: '推近',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-7.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {},
    },
    {
      elementId: '250130615241036',
      elementCode: 'flashBlack',
      elementName: '闪黑',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-14.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {},
    },
    {
      elementId: '250130615241044',
      elementCode: 'flashWhite',
      elementName: '闪白',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-13.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {},
    },
    {
      elementId: '250130615241080',
      elementCode: 'dreamyZoom',
      elementName: '顺时针旋转',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-12.webp',
      duration: '500',
      coincideDuration: '0',
      renderResource: {},
    },
    {
      elementId: '250130615241050',
      elementCode: 'zoom',
      elementName: '放大',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-8.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241065',
      elementCode: 'glitch',
      elementName: '震动泛光',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-11.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241071',
      elementCode: 'perlin',
      elementName: '溶解',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-16.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241098',
      elementCode: 'burn',
      elementName: '叠化',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-6.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241104',
      elementCode: 'fadeColor',
      elementName: '闪黑2',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-10.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241111',
      elementCode: 'fadeGrayScale',
      elementName: '褪色',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-9.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241127',
      elementCode: 'circleShowUp',
      elementName: '圆形遮罩1',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-15.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
    {
      elementId: '250130615241138',
      elementCode: 'circleHide',
      elementName: '圆形遮罩2',
      coverImgPath: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231220/vc-upload-1703054002280-4.png',
      originalUrl: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/process/20231206/vc-upload-1701855696458-5.webp',
      duration: '500',
      coincideDuration: '1',
      renderResource: {},
    },
  ]

  try {
    const existingCount = await Transition.countDocuments()
    if (existingCount > 0) {
      return res.json({ code: 200, message: '转场已存在，跳过', count: existingCount })
    }
    const inserted = await Transition.insertMany(presets)
    res.json({ code: 200, message: '转场入库成功', count: inserted.length })
  } catch (err) {
    next(err)
  }
})

export { router as transitionRouter }
