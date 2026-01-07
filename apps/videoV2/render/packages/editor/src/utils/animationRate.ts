import { type ISourceNode, timeConfig } from '@van-gogh/video-render-constants'

// 字幕动画进度
const animationRate = (currentTime: number, node: ISourceNode) => {
  let processRate = 1
  if (node.pipParams.transition === 'in') {
    processRate = (currentTime - node.startTime) / timeConfig.SUBTITLE_TRANSITION
    processRate = processRate > 1 ? 1 : processRate
    // 出场
  } else if (node.pipParams.transition === 'out') {
    if (currentTime > node.stopTime - timeConfig.SUBTITLE_TRANSITION) {
      processRate = 1 - ((node.stopTime - currentTime) / timeConfig.SUBTITLE_TRANSITION)
    } else {
      processRate = 0
    }
    // 循环
  } else {
    processRate = (currentTime - node.startTime) / node.duration
  }
  return processRate
}

export default animationRate
