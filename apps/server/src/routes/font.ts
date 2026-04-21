import { Router } from 'express'
import { Font } from '../models/Font.js'

const router = Router()

const seedPresets = [
  {
    elementId: '2501506194132012',
    elementType: 'font',
    elementCode: 'ce4d7a94a0fa1f337ab2bf7ab58342f84',
    elementName: '思源黑体_花字_10',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E5%B0%81%E9%9D%A2/%E8%8A%B1%E5%AD%976.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/json/%E8%8A%B1%E5%AD%976.pag.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E8%8A%B1%E5%AD%976.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
  {
    elementId: '2501506194129025',
    elementType: 'font',
    elementCode: 'ce4d7a94a0fa1f337ab2bf7ab58342f83',
    elementName: '思源黑体_花字_9',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E5%B0%81%E9%9D%A2/%E8%8A%B1%E5%AD%975.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/json/%E8%8A%B1%E5%AD%975.pag.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E8%8A%B1%E5%AD%975.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
  {
    elementId: '2501506194131027',
    elementType: 'font',
    elementCode: 'ce4d7a94a0fa1f337ab2bf7ab58342f82',
    elementName: '思源黑体_花字_8',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E5%B0%81%E9%9D%A2/%E8%8A%B1%E5%AD%973.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/json/%E8%8A%B1%E5%AD%973.pag.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E8%8A%B1%E5%AD%973.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
  {
    elementId: '2501506194128031',
    elementType: 'font',
    elementCode: 'ce4d7a94a0fa1f337ab2bf7ab58342f78',
    elementName: '思源黑体_花字_4',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E5%B0%81%E9%9D%A2/%E8%8A%B1%E5%AD%971.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/json/%E8%8A%B1%E5%AD%971.pag.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E8%8A%B1%E5%AD%971.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
  {
    elementId: '2501506194131013',
    elementType: 'font',
    elementCode: 'ce4d7a94a0fa1f337ab2bf7ab58342f81',
    elementName: '思源黑体_花字_7',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E5%B0%81%E9%9D%A2/%E8%8A%B1%E5%AD%979.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/json/%E8%8A%B1%E5%AD%979.pag.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_88475ab83563d22f6c40e9e7e7596109/pag/%E8%8A%B1%E5%AD%979.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
  {
    elementId: '2501501223723125',
    elementType: 'font',
    elementCode: '9c9999682cd3b3e6e2e9842e8dde7d09',
    elementName: '猫啃什锦黑_白底粉边',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_355f85214d4976c3da7d96a8536f31a5/%E8%8A%B1%E5%AD%97pag/aiaiai.jpeg',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_355f85214d4976c3da7d96a8536f31a5/%E8%8A%B1%E5%AD%97pag/%E8%8A%B1%E5%AD%972.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_355f85214d4976c3da7d96a8536f31a5/%E8%8A%B1%E5%AD%97pag/%E7%88%B1%E7%9A%84%E5%94%AF%E7%89%A9%E4%B8%BB%E4%B9%89pag.pag',
    scope: 'color_letter',
    supportMultiFont: true,
  },
  {
    elementId: '2501501173700250',
    elementType: 'font',
    elementCode: '78cbf3e9f35ea0d141f97f2c366f60d4',
    elementName: '字魂扁桃体_动态花字',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_ca15d00f211e726d1c3055befdef301f/%E5%A5%87%E5%A5%87%E6%80%AA%E6%80%AA/%E5%AD%97%E4%BD%93%E5%85%83%E7%B4%A0/screenshot-20250121-161120.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_355f85214d4976c3da7d96a8536f31a5/%E5%AD%97%E4%BD%93/hz01.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/material/ou_355f85214d4976c3da7d96a8536f31a5/%E8%8A%B1%E5%AD%971.pag',
    scope: 'color_letter',
    supportMultiFont: true,
  },
  {
    elementId: '2501409253305019',
    elementType: 'font',
    elementCode: 'fbd160f93232b157c3ebe90068247901',
    elementName: '方正兰亭圆',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_Resource/%E6%96%B9%E6%AD%A3%E5%85%B0%E4%BA%AD%E5%9C%86/preview.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_Resource/%E6%96%B9%E6%AD%A3%E5%85%B0%E4%BA%AD%E5%9C%86/font.json',
    pagUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/batch-video/res/%E5%B0%8F%E7%B1%B3%E5%AD%97%E5%B9%95%E6%A0%B7%E5%BC%8F/0612-1%E9%BB%84%E5%AD%97%E9%BB%91%E8%BE%B9.pag',
    scope: 'color_letter',
    supportMultiFont: true,
  },
  {
    elementId: '2501409123243013',
    elementType: 'font',
    elementCode: '9917b4a7d04b443ff94a8c2219ee7f53',
    elementName: '思源黑体-黄底白描边',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_Resource/%E6%80%9D%E6%BA%90%E9%BB%91%E4%BD%93-%E9%BB%84%E5%BA%95%E7%99%BD%E6%8F%8F%E8%BE%B9/perview.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_Resource/%E6%80%9D%E6%BA%90%E9%BB%91%E4%BD%93-%E9%BB%84%E5%BA%95%E7%99%BD%E6%8F%8F%E8%BE%B9/font.json',
    pagUrl: 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/batch-video/res/%E5%B0%8F%E7%B1%B3%E5%AD%97%E5%B9%95%E6%A0%B7%E5%BC%8F/0612-1%E9%BB%84%E5%AD%97%E9%BB%91%E8%BE%B9.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
  {
    elementId: '2501407082810021',
    elementType: 'font',
    elementCode: '93c3be7caaecbb3c3c4322b400a5f540',
    elementName: '美团字体_花字_粉色背景_白色字体',
    coverImgPath: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_%E8%8A%B1%E5%AD%97/%E8%B4%B4%E7%BA%B8_%E7%B2%89%E8%89%B2_01/t1.png',
    originalUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_%E8%8A%B1%E5%AD%97/%E8%B4%B4%E7%BA%B8_%E7%B2%89%E8%89%B2_01/meituan_purple.json',
    pagUrl: 'https://mogic-effect-test.oss-cn-hangzhou.aliyuncs.com/batch_fusion_demo/template_config_resource/PAG_%E8%8A%B1%E5%AD%97/%E8%B4%B4%E7%BA%B8_%E7%B2%89%E8%89%B2_01/%E8%B4%B4%E7%BA%B81.pag',
    scope: 'color_letter',
    supportMultiFont: false,
  },
]

type FontMaterialInput = {
  elementId: string
  elementCode?: string
  elementName: string
  coverImgPath: string
  originalUrl: string
  pagUrl: string
  scope?: string
  supportMultiFont?: boolean
  [key: string]: any
}

const toDoc = (item: FontMaterialInput) => ({
  elementId: item.elementId,
  elementCode: item.elementCode ?? '',
  elementName: item.elementName,
  coverImgPath: item.coverImgPath,
  originalUrl: item.originalUrl,
  pagUrl: item.pagUrl,
  scope: item.scope ?? 'color_letter',
  supportMultiFont: Boolean(item.supportMultiFont),
  payload: item,
})

// GET /api/font?page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit
    const [fonts, total] = await Promise.all([
      Font.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Font.countDocuments(),
    ])
    res.json({ code: 200, data: fonts, total, page, limit })
  } catch (err) {
    next(err)
  }
})

// POST /api/font/import - batch upsert
router.post('/import', async (req, res, next) => {
  try {
    const list = (Array.isArray(req.body) ? req.body : req.body?.items) as FontMaterialInput[]
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ code: 400, message: 'items 不能为空' })
    }

    const valid = list.filter((item) =>
      item?.elementId && item?.elementName && item?.coverImgPath && item?.originalUrl && item?.pagUrl,
    )
    if (!valid.length) {
      return res.status(400).json({ code: 400, message: '没有可入库的有效花字数据' })
    }

    const ops = valid.map((item) => ({
      updateOne: {
        filter: { elementId: item.elementId },
        update: { $set: toDoc(item) },
        upsert: true,
      },
    }))
    const result = await Font.bulkWrite(ops)

    res.json({
      code: 200,
      message: '花字入库成功',
      count: valid.length,
      upsertedCount: result.upsertedCount ?? 0,
      modifiedCount: result.modifiedCount ?? 0,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/font/seed - 内置花字一键入库
router.post('/seed', async (_req, res, next) => {
  try {
    const ops = seedPresets.map((item) => ({
      updateOne: {
        filter: { elementId: item.elementId },
        update: { $set: toDoc(item) },
        upsert: true,
      },
    }))
    const result = await Font.bulkWrite(ops)
    res.json({
      code: 200,
      message: '花字入库成功',
      count: seedPresets.length,
      upsertedCount: result.upsertedCount ?? 0,
      modifiedCount: result.modifiedCount ?? 0,
    })
  } catch (err) {
    next(err)
  }
})

export { router as fontRouter }
