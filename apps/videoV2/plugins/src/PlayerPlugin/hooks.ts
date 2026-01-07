import type { IFontInfo } from '@van-gogh/video-render'
import { Editor } from '@van-gogh/video-render-v2'
import { events, getTrackInfo } from '@van-gogh/video-editor'
import { useCoordScaleEvent, usePlayerPluginEvent, useTrackEvent } from '@van-gogh/video-editor-plugins'
import type { TrackType } from '@van-gogh/video-editor-shared'
import { onKeyStroke, useIntersectionObserver, useResizeObserver } from '@van-gogh/hooks'
import type { IFontConfig } from './index'
import { mergeTrackInfoBySdk } from './mergeProtocol'
import { TrackInfo } from '@van-gogh/video-editor-shared'

export const usePlayerData = (editor: Editor) => {
  const commandFunc = async (command: Parameters<Editor['commandFunc']>[0], data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await editor?.commandFunc(command, data)
  }

  const getTrackIdByTrackItemId = (trackItemId: string) => {
    return new Promise<string>((resolve) => {
      events.emit('protocol:track@get#trackItem', trackItemId, (track) => {
        if (!track) {
          return
        }
        resolve(track.trackId)
      })
    })
  }

  events.on('protocol:parsed', async (protocol) => {
    if (!protocol) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await editor?.resetProtocol(protocol as any)
  })

  events.on('protocol:trackItem@update', async (opt) => {
    let { trackItem, trackType, modifiedProps, trackId } = opt
    if (!trackId) {
      trackId = await getTrackIdByTrackItemId(trackItem.id)
    }
    const modifiedData = {
      trackType,
      trackId,
      content: {
        id: trackItem.id,
        ...modifiedProps,
      },
    }
    console.trace('update', JSON.stringify(modifiedData, null, 2))
    await commandFunc('update', modifiedData)
  })

  events.on('protocol:trackItem@delete', async (trackItemId) => {
    const modifiedData = {
      content: {
        id: trackItemId,
      },
    }
    console.trace('remove', JSON.stringify(modifiedData, null, 2))
    await commandFunc('remove', [modifiedData])
  })

  events.on('protocol:trackItems@splice#before', (trackType, trackId, start, deleteCount, items) => {
    events.emit('protocol:track@get#trackId', trackId, async (track) => {
      if (!track) {
        return
      }
      const removeTrackItemList = Array.from({ length: deleteCount }, (_, i) => {
        const trackItem = track.children[start + i]
        return {
          trackType,
          trackId,
          content: {
            id: trackItem.id,
          },
        }
      })
      const addTrackItemList = items.map((trackItem) => {
        return {
          trackType,
          trackId,
          content: {
            ...trackItem,
          },
        }
      })
      console.trace('remove', JSON.stringify(removeTrackItemList, null, 2))
      await commandFunc('remove', removeTrackItemList)
      console.trace('add', JSON.stringify(addTrackItemList, null, 2))
      await commandFunc('add', addTrackItemList)
    })
  })

  events.on('protocol:track@delete#before', (trackId) => {
    events.emit('protocol:track@get#trackId', trackId, async (track) => {
      if (!track) {
        return
      }
      const { trackType } = track
      const removeTrackItemList = track.children.map((trackItem) => {
        return {
          trackType,
          trackId,
          content: {
            id: trackItem.id,
          },
        }
      })
      console.trace('remove', JSON.stringify(removeTrackItemList, null, 2))
      await commandFunc('remove', removeTrackItemList)
    })
  })

  events.on('protocol:track@update', async (opt) => {
    const { trackType, trackId, modifiedProps } = opt
    if (!trackId || !trackType) {
      return
    }
    if ('hide' in modifiedProps) {
      const command = modifiedProps.hide ? 'hide' : 'show'
      const data = {
        trackType,
        trackId,
      }
      console.trace(command, JSON.stringify(data, null, 2))
      await commandFunc(command, data)
    }
  })

  events.on('protocol:tracks@splice#before', (trackType, start, deleteCount, addTracks) => {
    events.emit('protocol:tracks@get', trackType, async (tracks) => {
      const removeTrackItemList: { trackType: TrackType; trackId: string; content: any }[] = []
      if (tracks?.length) {
        for (let i = start; i < start + deleteCount; i++) {
          const track = tracks[i]
          track.children.forEach((trackItem) => {
            removeTrackItemList.push({
              trackType: track.trackType,
              trackId: track.trackId,
              content: {
                id: trackItem.id,
              },
            })
          })
        }
      }

      const addTrackItemList = addTracks.map((track) => {
        return track.children.map((trackItem) => {
          return {
            trackType,
            trackId: track.trackId,
            hide: track.hide,
            content: {
              ...trackItem,
            },
          }
        })
      }).flat()
      console.trace('remove', JSON.stringify(removeTrackItemList, null, 2))
      if (removeTrackItemList?.length) {
        await commandFunc('remove', removeTrackItemList)
      }
      console.trace('add', JSON.stringify(addTrackItemList, null, 2))
      if (addTrackItemList?.length) {
        await commandFunc('add', addTrackItemList)
      }
    })
  })
}

export const useVideoRenderer = (canvasRef: Ref<HTMLCanvasElement | undefined>, opts?: { preFontList?: IFontConfig[] }) => {
  let editor: Editor | null = null

  const loading = ref(true)

  const playing = ref(false)
  const muted = ref(false)
  const currentTime = ref(0) // ms
  const duration = ref(0)
  const cbRef = ref<() => void>()

  const { onTrackCurrentTimeChange, emitTrackCurrentTimeChange } = useTrackEvent()
  const { emitPlayerReady, onPlayerStateChange, emitPlayerStateChange, emitPlayerCurrentTimeChange, onPlayerSeek, onGetTrackInfoFromWasmSdk } = usePlayerPluginEvent()

  const setProgress = (progress: number) => {
    const time = progress * 1000
    if (time === currentTime.value) {
      return
    }
    currentTime.value = time
    emitTrackCurrentTimeChange(time)
    emitPlayerCurrentTimeChange(time)
  }

  const setPause = () => {
    playing.value = false
    currentTime.value = duration.value
  }
  const setState = (state: { loading?: boolean; playing?: boolean }) => {
    // 判断是否播放结束
    if (state.playing !== undefined && !state.playing) {
      setPause()
    }
    // 是否需要添加loading
    if (state.loading !== undefined) {
      loading.value = state.loading
    }
  }

  const handleTimeChange = async (time: number) => {
    if (time === currentTime.value) {
      return
    }
    loading.value = true
    await editor?.setProcess(time / 1000)
    loading.value = false
  }
  onTrackCurrentTimeChange(handleTimeChange)
  onPlayerSeek(handleTimeChange)

  onMounted(async () => {
    if (!canvasRef.value) {
      return
    }
    loading.value = true
    const trackInfo = await getTrackInfo()

    canvasRef.value.width = trackInfo.width
    canvasRef.value.height = trackInfo.height

    editor = new Editor({
      view: canvasRef.value,
      trackInfo: trackInfo as any,
      setProgress,
      setState,
      fontList: opts?.preFontList || [],
    })
    // 监听协议变化，并同步到渲染SDK，可以放在实例化Editor时触发
    cbRef.value = onGetTrackInfoFromWasmSdk(async (fn: (newTrackInfo: TrackInfo) => void) => {
      try {
        const newPartProtocol = JSON.parse(editor?.getProtocolStr()!) as TrackInfo
        const trackInfo = await getTrackInfo() as TrackInfo
        fn?.(mergeTrackInfoBySdk(newPartProtocol, trackInfo))
      } catch (e) {
      }
    })

    duration.value = await editor.duration * 1000
    editor?.setMute(muted.value)
    opts?.preFontList && await editor?.addFont(opts.preFontList)
    emitPlayerReady()
    loading.value = false
    usePlayerData(editor)
    // 实时监听轨道长度
    events.on('protocol:parsed', async (): Promise<void> => {
      if (!editor) {
        return
      }
      duration.value = await editor.duration * 1000
    })
  })
  onUnmounted(() => {
    cbRef.value?.()
  })
  watch(playing, () => {
    if (playing.value) {
      editor?.play()
    } else {
      editor?.pause()
    }
    emitPlayerStateChange({
      playing: playing.value,
      currentTime: editor?.currentTime,
    })
  })

  watch(muted, (val) => {
    editor?.setMute(val)
    emitPlayerStateChange({ muted: val })
  })

  onPlayerStateChange((state) => {
    if (state.playing !== undefined) {
      playing.value = state.playing
    }
    if (state.muted !== undefined) {
      muted.value = state.muted
      editor?.setMute(state.muted)
    }
    if (state.loading !== undefined) {
      loading.value = state.loading
    }
  })

  events.on('editor:destroy', () => {
    editor?.pause()
    editor?.destroy()
    editor = null
  })

  events.on('editor:addFont', async (fontList: Array<IFontInfo>) => {
    await editor?.addFont(fontList)
  })

  let targetIsVisible = true
  useIntersectionObserver(canvasRef, ([{ isIntersecting }]) => {
    targetIsVisible = isIntersecting
    if (!isIntersecting) {
      playing.value = false
    }
  })
  // ' ' 是空格 空格键暂停播放 https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values#whitespace_keys
  onKeyStroke(' ', (e) => {
    if (!targetIsVisible) {
      return
    }
    // 只有当焦点在 body 上时才触发
    if (document.activeElement === document.body) {
      e.preventDefault()
      playing.value = !playing.value
    }
  })

  return {
    editor,
    playing,
    muted,
    currentTime,
    duration,
    loading,
  }
}

export const usePlayerDom = (canvasRef: Ref<HTMLCanvasElement | undefined>, containerRef: Ref<HTMLDivElement | undefined>, opts?: { showController?: boolean }) => {
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  const { emitCoordScaleDraw } = useCoordScaleEvent()

  const setCanvasSize = (videoWidth: number, videoHeight: number, wrapWidth: number, wrapHeight: number) => {
    const videoRatio = videoWidth / videoHeight
    const wrapRatio = wrapWidth / wrapHeight
    if (videoRatio > wrapRatio) {
      canvasWidth.value = wrapWidth
      canvasHeight.value = wrapWidth / videoRatio
    } else {
      canvasWidth.value = wrapHeight * videoRatio
      canvasHeight.value = wrapHeight
    }
  }

  useResizeObserver(containerRef, async (entries) => {
    if (!canvasRef.value) {
      return
    }
    const entry = entries[0]
    const { width, height } = entry.contentRect
    // 48 是 VideoController 的高度
    setCanvasSize(canvasRef.value.width, canvasRef.value.height, width, height - (opts?.showController ? 48 : 0))
    await nextTick()
    emitCoordScaleDraw(canvasRef, {
      videoWidth: canvasRef.value.width,
      videoHeight: canvasRef.value.height,
    })
  })

  events.on('protocol:parsed', (protocol) => {
    if (!protocol || !canvasRef.value) {
      return
    }
    setCanvasSize(protocol.width, protocol.height, containerRef.value?.clientWidth || 0, (containerRef.value?.clientHeight || 0) - (opts?.showController ? 48 : 0))
    canvasRef.value.width = protocol.width
    canvasRef.value.height = protocol.height
  })

  return {
    canvasWidth,
    canvasHeight,
    setCanvasSize,
  }
}
