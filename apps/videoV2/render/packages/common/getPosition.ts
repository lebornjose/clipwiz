const positionConfig = [
  [400, 500], // 1比一
  [375, 710], // 3比4
  [360, 900], // 9 比 16
  [400, 800], // 3 比 2
  [640, 650], // 16 比 9
]

const getPosition = (dstWidth: number, dstHeight: number) => {
  if (dstWidth === dstHeight) { // 1: 1
    return positionConfig[0]
  }
  if (dstWidth / dstHeight === 3.0 / 4) {
    return positionConfig[1]
  }
  if (dstWidth / dstHeight === 9.0 / 16) {
    return positionConfig[2]
  }
  if (dstHeight / dstWidth === 3 / 2.0) {
    return positionConfig[3]
  }
  if (dstHeight / dstWidth === 9 / 16.0) {
    return positionConfig[4]
  }
}

export default getPosition
