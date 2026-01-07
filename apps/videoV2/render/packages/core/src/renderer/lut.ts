import { IPalette } from "@van-gogh/video-render-constants"

const defaultTemperature = 6550 // 默认值

interface ILutUtil {
  update: (imgLayer: IPalette, palette:IPalette) => void
}
const lutUtil: ILutUtil = {
  update(lut: IPalette, palette:IPalette) {
    lut.temperature = palette.temperature ?? defaultTemperature // 色温
    lut.brightness = palette.brightness ?? 0  // 亮度
    lut.contrast = palette.contrast ?? 0   // 对比度
    lut.fade = palette.fade ?? 0 // 褪色
    lut.highLight = palette.highLight ?? 0 // 高光
    lut.hue = palette.hue ?? 0 // 色调
    lut.saturation = palette.saturation ?? 0  // 饱和度
    lut.shadow = palette.shadow ?? 0// 阴影
    lut.corner = palette.corner ?? 0 // 暗角
    lut.particle = palette.particle ?? 0 // 颗粒
    lut.sharpen = palette.sharpen ?? 0 // 锐化
  }
}

export default lutUtil
