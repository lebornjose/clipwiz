import type { INode, IVideoTrackItem } from '@van-gogh/video-render-constants'
import type { Editor } from '../../index'

export const addTransition = (editor: Editor, trackId: string, item: IVideoTrackItem) => {
  const node = editor.videoCtx._sourceNodes.find((child: INode) => child.id === item.id)
  if (!node) {
    throw new Error('无法找到素材')
  }
  if (node.pipParams?.transitionIn?.effectId) {
    throw new Error('该素材已经存在转场')
  }
  item.transitionIn && (node.pipParams.transitionIn = item.transitionIn)
  item.transitionOut && (node.pipParams.transitionOut = item.transitionOut)
}
