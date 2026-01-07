// 封装使用多次的公共方法

import layerParams from './layerParams'
import reviewParams from './reviewParams'
import arrToColor from './arrToColor'
import getFontName from './getFontName'
import temperatureReplace from './temperatureReplace'
import getPosition from './getPosition'

const commandFunc = {
  layerParams,
  reviewParams,
  arrToColor,
  getFontName,
  temperatureReplace,
  getPosition,
}

export default commandFunc
