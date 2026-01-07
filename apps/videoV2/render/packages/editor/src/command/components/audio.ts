// 音频
import type { IAudioNode, IAudioTrackItem, ICommandContext, IFade, ISourceNode, ITrack } from '@van-gogh/video-render-constants'
import type { Editor } from '../../index'

export const updateAudioParams = (editor: Editor, msg: ICommandContext) => {
  const item = msg.content as IAudioTrackItem
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === item.id) as IAudioNode
  if (!node) {
    throw new Error('无法找到素材')
  }
  let key: keyof IAudioTrackItem
  for (key in item) {
    if (key === 'id') {
      continue
    }
    if (key === 'url') {
      node.elementURL = item[key]
      continue
    }
    if (key === 'playRate') {
      node.playbackRate = item[key]
      continue
    }
    if (['volume', 'fadeIn', 'fadeOut'].includes(key)) {
      if (key === 'volume') {
        node.sound = item[key]
        if (!node.hide) {
          node.volume = item[key]
        }
      } else {
        // @ts-ignore
        node[key] = item[key]
      }
    }
  }
}

export const updateBgmParams = (editor: Editor, msg: ICommandContext) => {
  const item = msg?.content as IAudioTrackItem
  if (item.fade?.length) {
    for (let i = 0; i < item.fade.length; i++) {
      const fade = item.fade[i]
      const fadeId = `${item.id}_${fade.index}`
      updateAudioParams(editor, {
        trackId: msg.trackId,
        trackType: msg.trackType,
        content: { ...fade, id: fadeId } as any,
      })
    }
  } else if (item.url) {
    const bgmAudio = editor.videoTrack.find((item: ITrack) => item.trackId === msg.trackId)
    if (!bgmAudio) {
      throw new Error('无法找到素材')
    }
    const audioItem = bgmAudio.children[0] as IAudioTrackItem
    if (audioItem?.fade?.length) {
      audioItem.fade.forEach((fade: IFade) => {
        const fadeId = `${item.id}_${fade.index}`
        updateAudioParams(editor, {
          trackId: msg.trackId,
          trackType: msg.trackType,
          content: { url: item.url, id: fadeId } as any,
        })
      })
    } else {
      updateAudioParams(editor, msg)
    }
  } else {
    updateAudioParams(editor, msg)
  }
}

export const displayOral = (editor: Editor, msg: ICommandContext, operate: boolean) => {
  const audioNode = editor.videoCtx._sourceNodes.find((item: ISourceNode) => item.id === msg.content.id) as IAudioNode
  if (!audioNode) {
    throw new Error('无法找到素材')
  }
  audioNode.hide = operate
  audioNode.volume = operate ? 0 : audioNode.sound
}

export const displayBgm = (editor: Editor, msg: ICommandContext, operate: boolean) => {
  const bgmAudio = editor.videoTrack.find((item: ITrack) => item.trackId === msg.trackId)
  if (!bgmAudio) {
    throw new Error('无法找到素材')
  }
  const item = bgmAudio.children[0] as IAudioTrackItem

  const bgmItem = msg.content as IAudioTrackItem
  if (item.fade && item.fade?.length) {
    for (const child of item.fade) {
      const fadeId = `${item.id}_${child.index}`
      const fadeNode = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === fadeId) as IAudioNode
      fadeNode.hide = operate
      fadeNode.volume = operate ? 0 : fadeNode.sound
    }
    return
  }
  const node = editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === item.id) as IAudioNode
  node.metaData = Object.assign(node.metaData, bgmItem)
  node.hide = operate
  node.volume = operate ? 0 : node.sound
  editor.movie?.renderer?.updateCmp2Content(node.id, node.metaData)
}
