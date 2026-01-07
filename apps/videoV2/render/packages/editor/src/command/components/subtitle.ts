import type { ICommandContext, IEditor, INode, ISourceNode, ISubtitleNode, ISubtitleTrackItem } from '@van-gogh/video-render-constants'
import type { Editor } from '../../index'
import convertEndTime from '../../utils/convertEndTime'

export const updateSubtitleParams = async (editor: Editor, msg: ICommandContext) => {
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === msg.content.id) as ISubtitleNode
  if (!node) {
    throw new Error('无法找到素材')
  }
  const item = msg.content as ISubtitleTrackItem
  if (item.url) {
    if (editor.currentTime >= node._startTime && editor.currentTime <= node._stopTime) {
      editor.movie?.renderer?.displayLayer(node.id, false)
    }
    node.materialId = item.materialId || ''
    node.pipParams.materialId = item.materialId
    node.pipParams.transition = item.transition
    void await editor.loadItemPag({ materialId: node.materialId, url: item.url })
  }
  if (item.startTime) {
    const startTime = item.startTime / 1000
    node.startTime = startTime
  }
  if (item.endTime) {
    const endTime = convertEndTime(item.endTime, editor.totalTime)
    node.stopTime = endTime / 1000
  }
  item.position && (node.pipParams.position = item.position)
  item.texts && (node.pipParams.texts = item.texts)
  node.metaData = Object.assign(node.metaData, item)
  console.log('updateSubtitleParams', node)
  editor.queueDraw()
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}

export const displaySubtitle = (editor: Editor, msg: ICommandContext, operate: boolean) => {
  const node = editor.videoCtx._sourceNodes.find((child: INode) => child.id === msg.content.id)
  if (!node) {
    throw new Error('无法找到素材')
  }
  if (node) {
    node.hide = operate
    if (node.pipParams) {
      node.pipParams.hide = operate
    }
  }
  const item = msg.content as ISubtitleTrackItem
  node.metaData = Object.assign(node.metaData, item)
  if (editor.currentTime >= node._startTime && editor.currentTime <= node._stopTime) {
    editor.movie?.renderer?.displayLayer(node.id, !operate)
  }
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}
