const maxL = 40000 // 色温最大值
const maxD = 1000
const defaultVal = 6550 // 默认值
const maxStep = (maxL - defaultVal) / 50 // 最大步进值
const minStep = (defaultVal - maxD) / 50 // 最小步进值

const temperatureReplace = (val: number) => {
  const result = val < 0 ? defaultVal + val * minStep : defaultVal + val * maxStep
  return result
}

export default temperatureReplace
