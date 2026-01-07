import type { IAudioNode, IAudioTrackItem, ICommandContext, ISourceNode } from '@van-gogh/video-render-constants'
import type { Editor } from '../../index'

export const updateSoundParams = (editor: Editor, msg: ICommandContext) => {
  const item = msg.content as IAudioTrackItem
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === item.id) as IAudioNode
  if (!node) {
    throw new Error('无法找到素材')
  }
  let key: keyof IAudioTrackItem
  for (key in item) {
    if (['volume'].includes(key)) {
      node.volume = item.volume
      node.sound = item.volume
    }
    if (key === 'url') {
      node.elementURL = item[key]
      node.stopTime = item.endTime / 1000
      continue
    }
  }
}
