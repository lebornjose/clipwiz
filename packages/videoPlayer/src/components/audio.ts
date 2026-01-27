import { type IAudioNode, type IAudioTrackItem, MATERIAL_TYPE } from '@clipwiz/shared'
import type { Editor } from '../index'
import { TIME_CONFIG } from '@clipwiz/shared'

const audioSeek = (audioNode: IAudioNode, nextVolume: number, prevVolume: number) => {
  if (audioNode.hide) {
    audioNode.volume = 0
    return
  }
  if (audioNode._currentTime < audioNode.startTime) {
    return
  }
  const currentTime = Math.trunc((audioNode._currentTime - audioNode.startTime) * 10) / 10
  const fadeIn = audioNode.fadeIn / TIME_CONFIG.MILL_TIME_CONVERSION
  const fadeOut = audioNode.fadeOut / TIME_CONFIG.MILL_TIME_CONVERSION
  if (currentTime > audioNode.duration) {
    return
  }
  const beginTime = audioNode.duration - fadeOut
  if (fadeIn && currentTime <= fadeIn) {
    const v = Math.trunc((prevVolume + (currentTime / fadeIn) * audioNode.sound) * TIME_CONFIG.MILL_TIME_CONVERSION) / TIME_CONFIG.MILL_TIME_CONVERSION
    audioNode.volume = v > audioNode.sound ? audioNode.sound : v
  } else if (fadeOut && currentTime >= beginTime) {
    const v = Math.trunc((audioNode.sound - ((currentTime - beginTime) / fadeOut)) * TIME_CONFIG.MILL_TIME_CONVERSION) / TIME_CONFIG.MILL_TIME_CONVERSION
    audioNode.volume = v < nextVolume ? nextVolume : v
  } else {
    audioNode.volume = audioNode.sound
  }
}

const audioFade = (audioNode: IAudioNode, nextVolume: number, prevVolume: number) => {
  if (audioNode.hide) {
    return
  }
  if (audioNode.fadeIn && audioNode._currentTime === 0) {
    audioNode.volume = prevVolume
  }
  if (!audioNode.fadeTimer) {
    audioNode.fadeTimer = setInterval(() => {
      audioSeek(audioNode, nextVolume, prevVolume)
    }, 250)
  }
}

const getPervNextVolume = (editor: Editor, item: IAudioTrackItem) => {
  const ids: string[] = item.id.split('_')
  const nextNode = editor.videoCtx._sourceNodes.find((item) => {
    return item.id === `${ids?.[0]}_${Number(ids?.[1]) + 1}`
  }) as IAudioNode
  const prevNode = editor.videoCtx._sourceNodes.find((item) => {
    return item.id === `${ids?.[0]}_${Number(ids?.[1]) - 1}`
  }) as IAudioNode
  let nextNodeVolume = nextNode?._attributes?.volume || 0
  nextNodeVolume = nextNodeVolume > item.volume ? 0 : nextNodeVolume
  let prevNodeVolume = prevNode?._attributes?.volume || 0 // 上一个音频的声音
  prevNodeVolume = prevNodeVolume < item.volume ? prevNodeVolume : 0

  return {
    nextNodeVolume,
    prevNodeVolume,
  }
}

export const addAudio = (editor: Editor, trackId: string, item: IAudioTrackItem) => {
  if (item.startTime >= editor.totalTime) {
    return
  }
  const { prevNodeVolume } = getPervNextVolume(editor, item)
  const audioNode = editor.videoCtx.audio(item.url!, item.fromTime / 1000, 4, {
    volume: item.fadeIn ? prevNodeVolume : (item.hide ? 0 : item.volume),
  })
  audioNode.id = item.id
  audioNode.trackId = trackId
  audioNode.muted = !!item.hide
  audioNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)

  const videoTotal = (item.toTime - item.fromTime)
  let endTime: number = Math.min(Math.ceil(videoTotal / item.playRate + item.startTime), item.endTime)
  if (item.format === MATERIAL_TYPE.BGM) {
    endTime = item.endTime
  }
  audioNode.stop(endTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  audioNode.sound = item.volume
  // 限制最大倍率为4
  audioNode.playbackRate = Math.min(item.playRate, 4)
  audioNode.hide = item.hide
  item.fadeIn && (audioNode.fadeIn = item.fadeIn)
  item.fadeOut && (audioNode.fadeOut = item.fadeOut)
  audioNode.connect(editor.videoCtx.destination)
  if (!audioNode.muted) {
    audioNode.registerCallback('play', () => {
      // 如果当前为静音状态，则不执行淡入淡出操作
      if (!editor.videoCtx.volume) {
        return
      }
      if ((Number(audioNode.sound) && audioNode.fadeIn) || audioNode.fadeOut) {
        audioNode.fade = true
        const { prevNodeVolume, nextNodeVolume } = getPervNextVolume(editor, item)
        audioFade(audioNode, nextNodeVolume, prevNodeVolume)
      }
    })
    audioNode.registerCallback('seek', () => {
      // 如果当前为静音状态，则不执行淡入淡出操作
      if (!editor.videoCtx.volume) {
        return
      }
      if (Number((audioNode.sound) && audioNode.fadeIn) || audioNode.fadeOut) {
        setTimeout(() => {
          // 如果在当前时间内，则计算声音，负责直接设置为0
          const { prevNodeVolume, nextNodeVolume } = getPervNextVolume(editor, item)
          if (audioNode._currentTime >= audioNode._startTime && audioNode._currentTime <= audioNode._stopTime) {
            audioSeek(audioNode, nextNodeVolume, prevNodeVolume)
          }
        })
      }
    })
    audioNode.registerCallback('pause', () => {
      if (audioNode.fade) {
        audioNode.fade = false
        audioNode.fadeTimer && clearInterval(audioNode.fadeTimer)
        audioNode.fadeTimer = null
      }
    })
    audioNode.registerCallback('ended', () => {
      if (audioNode.fade) {
        audioNode.fade = false
        audioNode.fadeTimer && clearInterval(audioNode.fadeTimer)
        audioNode.fadeTimer = null
      }
    })
  }
}

export const addBgm = (editor: Editor, trackId: string, item: IAudioTrackItem) => {
  addAudio(editor, trackId, item)
}
