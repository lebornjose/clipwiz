import { create } from 'zustand'
import type { ITrackInfo, IVideoTrackItem } from '@clipwiz/shared'
import { MATERIAL_TYPE, resolveTransitionBetweenItems } from '@clipwiz/shared'

interface EditorState {
  trackInfo: ITrackInfo | null
  /** Incremented each time trackInfo is committed (drag end / delete / load). VideoPlayer watches this. */
  trackInfoVersion: number
  selectedActionId: string | null
  selectedTransitionKey: string | null

  setTrackInfo: (info: ITrackInfo) => void
  setSelectedActionId: (id: string | null) => void
  setSelectedTransitionKey: (key: string | null) => void
  deleteSelectedAction: () => void
  deleteSelectedTransition: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  trackInfo: null,
  trackInfoVersion: 0,
  selectedActionId: null,
  selectedTransitionKey: null,

  setTrackInfo: (info) =>
    set((state) => ({
      trackInfo: info,
      trackInfoVersion: state.trackInfoVersion + 1,
    })),

  setSelectedActionId: (id) => set({ selectedActionId: id, selectedTransitionKey: null }),

  setSelectedTransitionKey: (key) => set({ selectedTransitionKey: key, selectedActionId: null }),

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
}))
