import { Slider, InputNumber } from 'antd'
import type { IVideoTrackItem, Transform } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { Section } from './FieldRow'
import { eventBus } from '../../utils'

interface Props {
  item: IVideoTrackItem
}

const DEFAULT_TRANSFORM: Transform = { scale: [1, 1, 1], rotate: [0, 0, 0], translate: [0, 0, 0] }

const SliderRow = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatter,
  parser,
}: {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  formatter?: (v: number | undefined) => string
  parser?: (v: string | undefined) => number
}) => (
  <div className="material-editor__field-row">
    <span className="material-editor__field-label" title={label}>{label}</span>
    <Slider
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      style={{ flex: 1, margin: '0 8px' }}
    />
    <InputNumber
      size="small"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(v) => onChange(v ?? min)}
      formatter={formatter}
      parser={parser}
      style={{ width: 72, flexShrink: 0 }}
    />
  </div>
)

const VideoEditor = ({ item }: Props) => {
  const { updateTrackItemById } = useEditorStore()
  const update = (patch: Partial<IVideoTrackItem>) => updateTrackItemById(item.id, patch)

  const transform = item.transform ?? DEFAULT_TRANSFORM
  const scaleVal = Math.round((transform.scale[0] ?? 1) * 100)
  const posX = Math.round(transform.translate[0] ?? 0)
  const posY = Math.round(transform.translate[1] ?? 0)
  const volumeVal = Math.round((item.volume ?? 1) * 100)
  const rateVal = Math.round((item.playRate ?? 1) * 100)

  const halfW = Math.round((item.width ?? 1920) / 2)
  const halfH = Math.round((item.height ?? 1080) / 2)

  const updateTransform = (patch: Partial<Transform>) => {
    const newTransform = { ...transform, ...patch }
    update({ transform: newTransform })
    eventBus.emit('transform:update', { id: item.id, transform: newTransform })
  }

  return (
    <div className="material-editor__fields">
      <Section title="位置大小" />

      <SliderRow
        label="缩放"
        min={10}
        max={200}
        value={scaleVal}
        onChange={(v) => updateTransform({ scale: [v / 100, v / 100, transform.scale[2]] })}
        formatter={(v) => `${v}%`}
        parser={(v) => Number(v?.replace('%', '') ?? 100)}
      />

      <SliderRow
        label="位置X"
        min={-halfW}
        max={halfW}
        value={posX}
        onChange={(v) => updateTransform({ translate: [v, transform.translate[1], transform.translate[2]] })}
      />

      <SliderRow
        label="位置Y"
        min={-halfH}
        max={halfH}
        value={posY}
        onChange={(v) => updateTransform({ translate: [transform.translate[0], v, transform.translate[2]] })}
      />

      <Section title="音频" />

      <SliderRow
        label="声音大小"
        min={0}
        max={100}
        value={volumeVal}
        onChange={(v) => update({ volume: v / 100 })}
        formatter={(v) => `${v}%`}
        parser={(v) => Number(v?.replace('%', '') ?? 0)}
      />

      <Section title="播放" />

      <SliderRow
        label="视频速率"
        min={10}
        max={300}
        value={rateVal}
        onChange={(v) => update({ playRate: v / 100 })}
        formatter={(v) => `${v}%`}
        parser={(v) => Number(v?.replace('%', '') ?? 100)}
      />
    </div>
  )
}

export default VideoEditor
