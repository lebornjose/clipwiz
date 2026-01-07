import type { ICommandContext, ISourceNode, ITextNode, ITextTrackItem } from '@van-gogh/video/render/packages/constants'
import type { Editor } from '../../index'
import convertEndTime from '../../utils/convertEndTime'

export const updateTextParams = async (editor: Editor, msg: ICommandContext) => {
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === msg.content.id) as ITextNode
  const item = msg.content as ITextTrackItem
  if (!node) {
    throw new Error('无法找到素材')
  }
  if (item.url) {
    if (editor.currentTime >= node._startTime && editor.currentTime <= node._stopTime) {
      editor.movie?.renderer.displayLayer(node.id, false)
    }
    node.pipParams.transition = item.transition
    editor.movie?.renderer.removeLayer(node)
    await editor.loadTextPag({ id: item.id, url: item.url })
  }
  if (item.startTime) {
    let startTime = item.startTime / 1000
    if (item.startTime > editor.totalTime) {
      startTime = editor.totalTime - 10
    }
    node.startTime = startTime
  }
  if (item.endTime) {
    const endTime = convertEndTime(item.endTime, editor.totalTime)
    node.stopTime = endTime / 1000
  }
  if (item.transform) {
    node.pipParams.transform = item.transform
  }
  item.position && (node.pipParams.position = item.position)
  item.texts && (node.pipParams.texts = item.texts)
  node.metaData = Object.assign(node.metaData, item)
  console.log('updateTextParams', node)
  editor.queueDraw()
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}
