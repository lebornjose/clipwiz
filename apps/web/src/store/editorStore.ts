import { create } from 'zustand'
import type { ITrackInfo, IVideoTrackItem, ITrack } from '@clipwiz/shared'
import { MATERIAL_TYPE, resolveTransitionBetweenItems } from '@clipwiz/shared'

const genId = () => Math.random().toString(36).slice(2, 10)

export interface VideoMaterialPayload {
  url: string
  type: 'video' | 'image'
  duration?: number // ms
  name?: string
  width?: number
  height?: number
  materialId?: string
}

interface EditorState {
  trackInfo: ITrackInfo | null
  /** Incremented each time trackInfo is committed (drag end / delete / load). VideoPlayer watches this. */
  trackInfoVersion: number
  selectedActionId: string | null
  selectedTrackId: string | null
  selectedTransitionKey: string | null
  /** Current playback time in seconds */
  currentTime: number

  setTrackInfo: (info: ITrackInfo) => void
  setSelectedActionId: (id: string | null) => void
  setSelectedAction: (trackId: string, actionId: string) => void
  setSelectedTransitionKey: (key: string | null) => void
  setCurrentTime: (time: number) => void
  deleteSelectedAction: () => void
  deleteSelectedTransition: () => void
  updateTrackItemById: (id: string, patch: Record<string, any>) => void
  updateSelectedTransition: (patch: Record<string, any>) => void
  addTrackItem: (trackType: MATERIAL_TYPE, item: Record<string, any>) => void
  addTextMaterial: (item: Record<string, any>) => void
  addVideoMaterial: (payload: VideoMaterialPayload) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  trackInfo: null,
  trackInfoVersion: 0,
  selectedActionId: null,
  selectedTrackId: null,
  selectedTransitionKey: null,
  currentTime: 0,

  setTrackInfo: (info) =>
    set((state) => ({
      trackInfo: info,
      trackInfoVersion: state.trackInfoVersion + 1,
    })),

  setSelectedActionId: (id) => set({ selectedActionId: id, selectedTrackId: null, selectedTransitionKey: null }),

  setSelectedAction: (trackId, actionId) => set({ selectedActionId: actionId, selectedTrackId: trackId, selectedTransitionKey: null }),

  setSelectedTransitionKey: (key) => set({ selectedTransitionKey: key, selectedActionId: null, selectedTrackId: null }),

  setCurrentTime: (time) => set({ currentTime: time }),

  deleteSelectedAction: () => {
    const { trackInfo, selectedActionId } = get()
    if (!trackInfo || !selectedActionId) return
    const newTracks = trackInfo.tracks
      .map((track) => ({
        ...track,
        children: (track.children as any[]).filter((child) => child.id !== selectedActionId),
      }))
      // Remove tracks that became empty after deletion
      .filter((track) => track.children.length > 0) as ITrackInfo['tracks']
    set((state) => ({
      trackInfo: { ...trackInfo, tracks: newTracks },
      trackInfoVersion: state.trackInfoVersion + 1,
      selectedActionId: null,
    }))
  },

  deleteSelectedTransition: () => {
    const { trackInfo, selectedTransitionKey } = get()
    if (!trackInfo || !selectedTransitionKey) return

    const newTracks = trackInfo.tracks.map((track) => {
      if (track.trackType !== MATERIAL_TYPE.VIDEO) return track

      const children = [...track.children] as IVideoTrackItem[]
      let overlapMs = 0
      let overlapStartIdx = -1

      for (let i = 0; i < children.length - 1; i++) {
        const resolved = resolveTransitionBetweenItems(children[i], children[i + 1])
        if (resolved && resolved.key === selectedTransitionKey) {
          overlapMs = children[i].endTime - children[i + 1].startTime
          overlapStartIdx = i + 1
          children[i] = { ...children[i], transitionOut: undefined }
          children[i + 1] = { ...children[i + 1], transitionIn: undefined }
          break
        }
      }

      // Shift clips from overlapStartIdx onwards to close the gap left by the removed overlap
      if (overlapStartIdx >= 0 && overlapMs > 0) {
        for (let i = overlapStartIdx; i < children.length; i++) {
          children[i] = {
            ...children[i],
            startTime: children[i].startTime + overlapMs,
            endTime: children[i].endTime + overlapMs,
          }
        }
      }

      return { ...track, children }
    })

    set((state) => ({
      trackInfo: { ...trackInfo, tracks: newTracks as ITrackInfo['tracks'] },
      trackInfoVersion: state.trackInfoVersion + 1,
      selectedTransitionKey: null,
    }))
  },

  updateTrackItemById: (id, patch) => {
    const { trackInfo } = get()
    if (!trackInfo) return
    const newTracks = trackInfo.tracks.map((track) => ({
      ...track,
      children: (track.children as any[]).map((child) =>
        child.id === id ? { ...child, ...patch } : child
      ),
    }))
    set({ trackInfo: { ...trackInfo, tracks: newTracks as ITrackInfo['tracks'] } })
  },

  addTrackItem: (trackType, item) => {
    const { trackInfo, currentTime } = get()
    if (!trackInfo) return
    const currentTimeMs = Math.max(0, Math.floor(currentTime * 1000))
    const topTrackTypes = new Set([MATERIAL_TYPE.PHOTO, MATERIAL_TYPE.FILTER, MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.SOUND_AUDIO])
    const pointerStartTrackTypes = new Set([MATERIAL_TYPE.PHOTO, MATERIAL_TYPE.FILTER, MATERIAL_TYPE.BGM_AUDIO, MATERIAL_TYPE.SOUND_AUDIO])
    const defaultStartTime = pointerStartTrackTypes.has(trackType) ? currentTimeMs : 0
    const explicitStartTime = typeof item.startTime === 'number' ? item.startTime : undefined
    const startTime = explicitStartTime ?? defaultStartTime
    const explicitDuration = typeof item.duration === 'number' ? item.duration : undefined
    const explicitEndTime = typeof item.endTime === 'number' ? item.endTime : undefined
    const duration = explicitDuration ?? Math.max(0, trackInfo.duration - startTime)
    const endTime = explicitEndTime ?? Math.min(trackInfo.duration, startTime + duration)
    const newItem = {
      id: genId(),
      hide: false,
      ...item,
      startTime,
      endTime,
      duration,
    }
    const existingTrack = trackInfo.tracks.find((t) => t.trackType === trackType)
    let newTracks: ITrack[]
    if (existingTrack) {
      const updatedTracks = trackInfo.tracks.map((t) =>
        t.trackType === trackType
          ? { ...t, children: [...(t.children as any[]), newItem] }
          : t
      ) as ITrack[]
      if (topTrackTypes.has(trackType)) {
        const targetTrack = updatedTracks.find((t) => t.trackType === trackType)
        const otherTracks = updatedTracks.filter((t) => t.trackType !== trackType)
        newTracks = targetTrack ? [targetTrack, ...otherTracks] : updatedTracks
      } else {
        newTracks = updatedTracks
      }
    } else {
      const newTrack = { trackId: genId(), trackType, hide: false, children: [newItem] } as ITrack
      // 贴图/滤镜/音频轨道默认置顶，避免新增后出现在时间轴最底部
      newTracks = topTrackTypes.has(trackType)
        ? [newTrack, ...trackInfo.tracks]
        : [...trackInfo.tracks, newTrack]
    }
    set((state) => ({
      trackInfo: { ...trackInfo, tracks: newTracks },
      trackInfoVersion: state.trackInfoVersion + 1,
    }))
  },

  addTextMaterial: (item) => {
    const { trackInfo, currentTime } = get()
    if (!trackInfo) return

    const startTime = Math.max(0, Math.floor(currentTime * 1000))
    const maxDuration = Math.max(1, trackInfo.duration - startTime)
    const duration = Math.min(2000, maxDuration)
    const endTime = startTime + duration

    const textItem = {
      id: genId(),
      hide: false,
      format: MATERIAL_TYPE.TEXT,
      startTime,
      endTime,
      duration,
      text: '',
      ...item,
    }

    const textTracks = trackInfo.tracks.filter((t) => t.trackType === MATERIAL_TYPE.TEXT)
    const occupied = textTracks.some((track) =>
      (track.children as any[]).some((child) => child.startTime <= startTime && child.endTime > startTime),
    )

    let newTracks: ITrack[]
    if (textTracks.length === 0 || occupied) {
      const newTrack = {
        trackId: genId(),
        trackType: MATERIAL_TYPE.TEXT,
        hide: false,
        children: [textItem],
      } as ITrack
      // 花字轨道默认置顶，保证新增后展示在时间轴最上方
      newTracks = [newTrack, ...trackInfo.tracks]
    } else {
      const targetTrack = textTracks[0]
      newTracks = trackInfo.tracks.map((track) =>
        track.trackId === targetTrack.trackId
          ? { ...track, children: [...(track.children as any[]), textItem] }
          : track,
      ) as ITrack[]
    }

    set((state) => ({
      trackInfo: { ...trackInfo, tracks: newTracks },
      trackInfoVersion: state.trackInfoVersion + 1,
    }))
  },

  addVideoMaterial: (payload) => {
    const { trackInfo, currentTime } = get()
    if (!trackInfo) return

    const currentTimeMs = currentTime * 1000
    const itemDuration = payload.type === 'image' ? 2000 : (payload.duration ?? 2000)
    const format = payload.type === 'image' ? MATERIAL_TYPE.IMAGE : MATERIAL_TYPE.VIDEO

    const isVideo = payload.type === 'video'
    const baseItem = {
      id: genId(),
      hide: false,
      url: payload.url,
      format,
      title: payload.name,
      materialId: payload.materialId,
      duration: itemDuration,
      width: payload.width ?? 1920,
      height: payload.height ?? 1080,
      startTime: 0,
      endTime: itemDuration,
    }
    const newItem = (
      isVideo
        ? { ...baseItem, fromTime: 0, toTime: itemDuration, volume: 1, playRate: 1, needCut: 0 }
        : baseItem
    ) as IVideoTrackItem

    const videoTracks = trackInfo.tracks.filter((t) => t.trackType === MATERIAL_TYPE.VIDEO)
    const isOccupied = videoTracks.some((t) =>
      (t.children as IVideoTrackItem[]).some(
        (c) => c.startTime <= currentTimeMs && c.endTime > currentTimeMs
      )
    )

    let newTracks: ITrack[]
    if (isOccupied || videoTracks.length === 0) {
      // Current time is occupied or no video track exists — create a new video track, clip starts at 0
      const newTrack = {
        trackId: genId(),
        trackType: MATERIAL_TYPE.VIDEO,
        hide: false,
        children: [newItem],
      } as ITrack
      newTracks = [...trackInfo.tracks, newTrack]
    } else {
      // Append after the last clip in the first video track
      const firstVideoTrack = videoTracks[0]
      const clips = firstVideoTrack.children as IVideoTrackItem[]
      const maxEnd = clips.reduce((m, c) => Math.max(m, c.endTime), 0)
      const positioned: IVideoTrackItem = {
        ...newItem,
        startTime: maxEnd,
        endTime: maxEnd + itemDuration,
      }
      newTracks = trackInfo.tracks.map((t) =>
        t.trackId === firstVideoTrack.trackId
          ? { ...t, children: [...(t.children as IVideoTrackItem[]), positioned] }
          : t
      ) as ITrack[]
    }

    set((state) => ({
      trackInfo: { ...trackInfo, tracks: newTracks },
      trackInfoVersion: state.trackInfoVersion + 1,
    }))
  },

  updateSelectedTransition: (patch) => {
    const { trackInfo, selectedTransitionKey } = get()
    if (!trackInfo || !selectedTransitionKey) return
    const newTracks = trackInfo.tracks.map((track) => {
      if (track.trackType !== MATERIAL_TYPE.VIDEO) return track
      const children = (track.children as IVideoTrackItem[]).map((child) => {
        const updated = { ...child }
        if (child.transitionOut) {
          const key = resolveTransitionBetweenItems(child, child)?.key ??
            [...(child.transitionOut.layerList || [])].sort().join('_')
          if (key === selectedTransitionKey) {
            updated.transitionOut = { ...child.transitionOut, ...patch }
          }
        }
        if (child.transitionIn) {
          const key = [...(child.transitionIn.layerList || [])].sort().join('_')
          if (key === selectedTransitionKey) {
            updated.transitionIn = { ...child.transitionIn, ...patch }
          }
        }
        return updated
      })
      return { ...track, children }
    })
    set({ trackInfo: { ...trackInfo, tracks: newTracks as ITrackInfo['tracks'] } })
  },
}))
