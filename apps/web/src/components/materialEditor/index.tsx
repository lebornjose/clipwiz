import { useMemo } from 'react'
import { MATERIAL_TYPE, resolveTransitionBetweenItems } from '@clipwiz/shared'
import type {
  IVideoTrackItem,
  IAudioTrackItem,
  ISubtitleTrackItem,
  ITextTrackItem,
  IPhotoTrackItem,
  TransitionItem,
} from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import VideoEditor from './VideoEditor'
import BgmEditor from './BgmEditor'
import SubtitleEditor from './SubtitleEditor'
import TextEditor from './TextEditor'
import TransitionEditor from './TransitionEditor'
import PhotoEditor from './PhotoEditor'
import './index.less'

const TITLE_MAP: Record<string, string> = {
  [MATERIAL_TYPE.VIDEO]: '视频',
  [MATERIAL_TYPE.BGM_AUDIO]: 'BGM',
  [MATERIAL_TYPE.SOUND_AUDIO]: '音效',
  [MATERIAL_TYPE.SUBTITLE]: '字幕',
  [MATERIAL_TYPE.TEXT]: '花字',
  [MATERIAL_TYPE.PHOTO]: '贴图',
  [MATERIAL_TYPE.FILTER]: '滤镜',
  transition: '转场',
}

const MaterialEditor = () => {
  const { trackInfo, selectedActionId, selectedTrackId, selectedTransitionKey } = useEditorStore()

  const selected = useMemo(() => {
    if (!trackInfo) return null

    if (selectedTransitionKey) {
      for (const track of trackInfo.tracks) {
        if (track.trackType !== MATERIAL_TYPE.VIDEO) continue
        const children = track.children as IVideoTrackItem[]
        for (let i = 0; i < children.length - 1; i++) {
          const resolved = resolveTransitionBetweenItems(children[i], children[i + 1])
          if (resolved && resolved.key === selectedTransitionKey) {
            return { type: 'transition' as const, data: resolved.transition }
          }
        }
      }
      return null
    }

    if (selectedActionId) {
      // Prefer precise lookup by track ID (avoids cross-track ID collisions)
      const tracksToSearch = selectedTrackId
        ? trackInfo.tracks.filter((t) => t.trackId === selectedTrackId)
        : trackInfo.tracks
      for (const track of tracksToSearch) {
        const child = (track.children as any[]).find((c) => c.id === selectedActionId)
        if (child) {
          return { type: track.trackType as string, data: child }
        }
      }
    }

    return null
  }, [trackInfo, selectedActionId, selectedTrackId, selectedTransitionKey])

  if (!selected) {
    return (
      <div className="material-editor material-editor--empty">
        <span className="material-editor__empty-hint">选中轨道素材后在此编辑</span>
      </div>
    )
  }

  const title = TITLE_MAP[selected.type] ?? '素材'

  return (
    <div className="material-editor">
      <div className="material-editor__header">
        <span className="material-editor__title">{title}</span>
      </div>

      <div className="material-editor__body">
        {selected.type === MATERIAL_TYPE.VIDEO && (
          <VideoEditor item={selected.data as IVideoTrackItem} />
        )}
        {selected.type === MATERIAL_TYPE.BGM_AUDIO && (
          <BgmEditor item={selected.data as IAudioTrackItem} />
        )}
        {selected.type === MATERIAL_TYPE.SOUND_AUDIO && (
          <BgmEditor item={selected.data as IAudioTrackItem} />
        )}
        {selected.type === MATERIAL_TYPE.SUBTITLE && (
          <SubtitleEditor item={selected.data as ISubtitleTrackItem} />
        )}
        {selected.type === MATERIAL_TYPE.TEXT && (
          <TextEditor item={selected.data as ITextTrackItem} />
        )}
        {selected.type === 'transition' && (
          <TransitionEditor transition={selected.data as TransitionItem} />
        )}
        {(selected.type === MATERIAL_TYPE.PHOTO) && (
          <PhotoEditor item={selected.data as IPhotoTrackItem} />
        )}
      </div>
    </div>
  )
}

export default MaterialEditor
