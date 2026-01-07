import type { IMaterials, ISourceNode, IVideoNode, IVideoTrackItem } from '@van-gogh/video-render-constants'
import { TRANSITION_TYPE, effectConfig } from '@van-gogh/video-render-constants'
import type { Editor } from '../index'

const transitionOutRate = 0.5 // 出场的进度从0.5开始
// const transitionTime = 1 // 转场在单视频上的过渡时间， 有叠加

const isNotTimeTransition = (editor: Editor, effectInNode: ISourceNode) => {
  if (!effectInNode.pipParams?.transitionIn && !effectInNode.pipParams?.transitionOut) {
    return null
  }
  const duration = effectInNode.pipParams?.transitionIn?.duration || effectInNode.pipParams?.transitionOut?.duration
  const transitionTime = (duration || 0) / 1000 / 2
  if (effectInNode.pipParams?.transitionIn && editor.currentTime > effectInNode.stopTime - transitionTime) {
    return 'effectIn'
  }
  // TODO 因为现在有数字人多条轨道，所以转场这里需要放开，不然转场就无法进行关闭了
  if (
    effectInNode.pipParams?.transitionOut
      && editor.currentTime >= effectInNode.startTime
      // && editor.currentTime <= effectInNode.startTime + transitionTime
  ) {
    return 'effectOut'
  }
  return null
}

const isTimeTransition = (editor: Editor, effectInNode: IVideoNode) => {
  if (!effectInNode.pipParams?.transitionOut) {
    return null
  }
  const transitionDuration = (effectInNode?.metaData?.transitionOut?.duration || 500) / 1000
  if (
    effectInNode.pipParams?.transitionOut && editor.currentTime <= effectInNode.startTime + (transitionDuration / 2)
  ) {
    return effectConfig.EFFECT_OUT
  }
  return null
}

export const setTransition = (editor: Editor, item: IMaterials) => {
  // 出场
  if (isTimeTransition(editor, item.node as IVideoNode) === effectConfig.EFFECT_OUT) {
    const transitionOut = item.node.pipParams.transitionOut
    const transitionIn = item.node.pipParams.transitionIn
    const duration = (transitionOut?.duration || 0) / 1000
    const rate = ((editor.currentTime - item.node.startTime) / duration) / 2
    let progress = transitionOutRate + rate
    progress = progress > 1 ? 1 : progress
    editor.movie?.renderer?.drawTransition(
      item.node,
      transitionOut!,
      transitionIn!,
      progress,
    )
    return
  } else {
    const transitionOut = item.node.pipParams.transitionOut
    const transitionIn = item.node.pipParams.transitionIn
    editor.movie?.renderer?.drawTransition(
      item.node,
      transitionOut!,
      transitionIn!,
      1,
    )
  }
  if (isNotTimeTransition(editor, item.node) === effectConfig.EFFECT_IN) {
    const transitionIn = item.node?.pipParams?.transitionIn
    const transitionOut = item.node?.pipParams?.transitionOut
    const duration = (transitionIn?.duration || 0) / 1000
    const progress = ((duration / 2) - (item.node.stopTime - editor.currentTime)) / duration
    editor.movie?.renderer.drawTransition(
      item.node,
      transitionIn!,
      transitionOut!,
      progress,
    )
  } 
  // else {
  //   const transitionIn = item.node?.pipParams?.transitionIn
  //   const transitionOut = item.node?.pipParams?.transitionOut
  //   editor.movie?.renderer.drawTransition(
  //     item.node,
  //     transitionIn!,
  //     transitionOut!,
  //     0,
  //   )
  // }
  // if (item.node.pipParams?.transitionIn?.format === TRANSITION_TYPE.NORMAL || item.node.pipParams?.transitionOut?.format === TRANSITION_TYPE.NORMAL) {
  //   else if (isNotTimeTransition(editor, item.node) === effectConfig.EFFECT_OUT) {
  //     const transitionOut = item.node?.pipParams?.transitionOut
  //     const duration = (transitionOut?.duration || 0) / 1000 / 2
  //     const rate = ((editor.currentTime - item.node.startTime) / duration) / 2
  //     const progress = transitionOutRate + rate
  //     editor.movie?.renderer?.drawTransition(
  //       item.node,
  //       transitionOut!,
  //       progress,
  //     )
  //   }else {
  //     const transitionIn = item.node?.pipParams?.transitionIn || item.node?.pipParams?.transitionOut
  //     editor.movie?.renderer.drawTransition(
  //       item.node,
  //       transitionIn!,
  //       0,
  //     )
  //   }
  // }
}
export const hideAllTransition = (editor: Editor) => {
  editor.movie?.renderer.hideAllTransition()
}

