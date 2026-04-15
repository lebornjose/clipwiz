import { Slider, Switch, InputNumber, Select } from 'antd'
import type { IVideoTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow, Section } from './FieldRow'

interface Props {
  item: IVideoTrackItem
}

const PLAY_RATE_OPTIONS = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
]

const VideoEditor = ({ item }: Props) => {
  const { updateTrackItemById } = useEditorStore()
  const update = (patch: Partial<IVideoTrackItem>) => updateTrackItemById(item.id, patch)

  return (
    <div className="material-editor__fields">
      <Section title="音频" />
      <FieldRow label="音量">
        <Slider
          min={0} max={1} step={0.01}
          value={item.volume ?? 1}
          onChange={(v) => update({ volume: v })}
        />
      </FieldRow>
      <FieldRow label="静音">
        <Switch size="small" checked={item.muted ?? false} onChange={(v) => update({ muted: v })} />
      </FieldRow>

      <Section title="播放" />
      <FieldRow label="倍速">
        <Select
          size="small"
          value={item.playRate ?? 1}
          options={PLAY_RATE_OPTIONS}
          onChange={(v) => update({ playRate: v })}
          style={{ width: '100%' }}
        />
      </FieldRow>

      <Section title="淡化" />
      <FieldRow label="淡入 (ms)">
        <InputNumber size="small" min={0} step={100} value={item.fadeIn ?? 0}
          onChange={(v) => update({ fadeIn: v ?? 0 })} style={{ width: '100%' }} />
      </FieldRow>
      <FieldRow label="淡出 (ms)">
        <InputNumber size="small" min={0} step={100} value={item.fadeOut ?? 0}
          onChange={(v) => update({ fadeOut: v ?? 0 })} style={{ width: '100%' }} />
      </FieldRow>

      <Section title="裁剪" />
      <FieldRow label="入点 (ms)">
        <InputNumber size="small" min={0} value={item.fromTime}
          onChange={(v) => update({ fromTime: v ?? 0 })} style={{ width: '100%' }} />
      </FieldRow>
      <FieldRow label="出点 (ms)">
        <InputNumber size="small" min={0} value={item.toTime}
          onChange={(v) => update({ toTime: v ?? 0 })} style={{ width: '100%' }} />
      </FieldRow>
    </div>
  )
}

export default VideoEditor
