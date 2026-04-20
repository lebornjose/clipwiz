import { InputNumber, Slider } from 'antd'
import type { IPhotoTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow, Section } from './FieldRow'
import { eventBus } from '../../utils'
import { useEffect, useState } from 'react'

interface Props {
  item: IPhotoTrackItem
}

const NumberWithSlider = ({
  min,
  max,
  step,
  value,
  onChange,
  onCommit,
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  onCommit: (v: number) => void
}) => (
  <div
    style={{ display: 'grid', gridTemplateColumns: '1fr 88px', gap: 8, alignItems: 'center' }}
    onMouseDown={(e) => e.stopPropagation()}
    onPointerDown={(e) => e.stopPropagation()}
  >
    <Slider
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(v) => onChange(Number(v) || 0)}
      onChangeComplete={(v) => onCommit(Number(v) || 0)}
    />
    <InputNumber
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(v) => {
        const next = Number(v) || 0
        onChange(next)
        onCommit(next)
      }}
      style={{ width: '100%' }}
    />
  </div>
)

const PhotoEditor = ({ item }: Props) => {
  const { updateTrackItemById, trackInfo } = useEditorStore()
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
  const update = (patch: Partial<IPhotoTrackItem>) => {
    updateTrackItemById(item.id, patch)
  }

  const transform = item.transform ?? { scale: [1, 1, 1], rotate: [0, 0, 0], translate: [0, 0, 0] }
  const [draft, setDraft] = useState(transform)

  useEffect(() => {
    setDraft(transform)
  }, [item.id, transform.scale?.[0], transform.rotate?.[2], transform.translate?.[0], transform.translate?.[1]])

  const maxTranslateX = (trackInfo?.width ?? 1280) / 2
  const maxTranslateY = (trackInfo?.height ?? 720) / 2
  const scale = clamp(draft.scale?.[0] ?? 1, 0.1, 2)
  const rotateZ = clamp(draft.rotate?.[2] ?? 0, 0, 360)
  const translateX = clamp(draft.translate?.[0] ?? 0, -maxTranslateX, maxTranslateX)
  const translateY = clamp(draft.translate?.[1] ?? 0, -maxTranslateY, maxTranslateY)

  const commitTransform = (next: typeof transform) => {
    setDraft(next)
    update({ transform: next })
    eventBus.emit('transform:update', { id: item.id, transform: next })
  }

  return (
    <div className="material-editor__fields">
      <Section title="缩放" />
      <FieldRow label="Scale">
        <NumberWithSlider
          min={0.1}
          max={2}
          step={0.01}
          value={scale}
          onChange={(v) => {
            const next = clamp(v, 0.1, 2)
            setDraft({ ...draft, scale: [next, next, draft.scale?.[2] ?? 1] })
          }}
          onCommit={(v) => {
            const next = clamp(v, 0.1, 2)
            commitTransform({ ...draft, scale: [next, next, draft.scale?.[2] ?? 1] })
          }}
        />
      </FieldRow>

      <Section title="位移" />
      <FieldRow label="X">
        <NumberWithSlider
          min={-maxTranslateX}
          max={maxTranslateX}
          step={1}
          value={translateX}
          onChange={(v) => {
            const next = clamp(v, -maxTranslateX, maxTranslateX)
            setDraft({ ...draft, translate: [next, draft.translate?.[1] ?? 0, draft.translate?.[2] ?? 0] })
          }}
          onCommit={(v) => {
            const next = clamp(v, -maxTranslateX, maxTranslateX)
            commitTransform({ ...draft, translate: [next, draft.translate?.[1] ?? 0, draft.translate?.[2] ?? 0] })
          }}
        />
      </FieldRow>
      <FieldRow label="Y">
        <NumberWithSlider
          min={-maxTranslateY}
          max={maxTranslateY}
          step={1}
          value={translateY}
          onChange={(v) => {
            const next = clamp(v, -maxTranslateY, maxTranslateY)
            setDraft({ ...draft, translate: [draft.translate?.[0] ?? 0, next, draft.translate?.[2] ?? 0] })
          }}
          onCommit={(v) => {
            const next = clamp(v, -maxTranslateY, maxTranslateY)
            commitTransform({ ...draft, translate: [draft.translate?.[0] ?? 0, next, draft.translate?.[2] ?? 0] })
          }}
        />
      </FieldRow>
    </div>
  )
}

export default PhotoEditor
