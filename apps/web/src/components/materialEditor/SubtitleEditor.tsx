import { Input, InputNumber, Select, Slider } from 'antd'
import type { ISubtitleTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow, Section } from './FieldRow'
import { eventBus } from '../../utils'

interface Props {
  item: ISubtitleTrackItem
}

const toRgbString = (rgb: [number, number, number]) =>
  `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`

const fromHex = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

const toHex = (rgb: [number, number, number]) =>
  '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')

const FONT_FAMILY_OPTIONS = [
  { label: '字制趣喜麦体', value: 'ZiZhiQuXiMaiTi' },
  { label: '思源黑体', value: 'Source Han Sans' },
  { label: '思源宋体', value: 'Source Han Serif' },
  { label: '阿里巴巴普惠体', value: 'Alibaba PuHuiTi' },
  { label: 'PingFang SC', value: 'PingFang SC' },
]

const SubtitleEditor = ({ item }: Props) => {
  const { updateTrackItemById, trackInfo } = useEditorStore()
  const update = (patch: Partial<ISubtitleTrackItem>) => {
    updateTrackItemById(item.id, patch)
    eventBus.emit('subtitle:update', { id: item.id, patch })
  }
  const maxX = Math.max(0, trackInfo?.width ?? 1280)
  const maxY = Math.max(0, trackInfo?.height ?? 720)
  const currentFont = item.fontFamily || FONT_FAMILY_OPTIONS[0].value
  const fontOptions = FONT_FAMILY_OPTIONS.some((v) => v.value === currentFont)
    ? FONT_FAMILY_OPTIONS
    : [{ label: currentFont, value: currentFont }, ...FONT_FAMILY_OPTIONS]

  return (
    <div className="material-editor__fields">
      <Section title="内容" />
      <FieldRow label="文本">
        <Input.TextArea size="small" rows={3} value={item.text}
          onChange={(e) => update({ text: e.target.value })} />
      </FieldRow>

      <Section title="字体" />
      <FieldRow label="大小">
        <InputNumber size="small" min={8} max={200} value={item.fontSize}
          onChange={(v) => update({ fontSize: v ?? 40 })} style={{ width: '100%' }} />
      </FieldRow>
      <FieldRow label="字体">
        <Select
          size="small"
          value={currentFont}
          options={fontOptions}
          onChange={(v) => update({ fontFamily: v })}
          style={{ width: '100%' }}
        />
      </FieldRow>

      <Section title="颜色" />
      <FieldRow label="字体颜色">
        <div className="material-editor__color-row">
          <input type="color" className="material-editor__color-input"
            value={toHex(item.color ?? [255, 255, 255])}
            onChange={(e) => update({ color: fromHex(e.target.value) })} />
          <span className="material-editor__color-label">
            {toRgbString(item.color ?? [255, 255, 255])}
          </span>
        </div>
      </FieldRow>
      <FieldRow label="描边颜色">
        <div className="material-editor__color-row">
          <input type="color" className="material-editor__color-input"
            value={toHex(item.strokeColor ?? [0, 0, 0])}
            onChange={(e) => update({ strokeColor: fromHex(e.target.value) })} />
          <span className="material-editor__color-label">
            {toRgbString(item.strokeColor ?? [0, 0, 0])}
          </span>
        </div>
      </FieldRow>
      <FieldRow label="描边宽度">
        <Slider
          min={0}
          max={40}
          step={1}
          value={item.strokeWidth ?? 0}
          onChange={(v) => update({ strokeWidth: Number(v) || 0 })}
          tooltip={{ formatter: (v) => `${v ?? 0}px` }}
        />
      </FieldRow>

      <Section title="位置" />
      <FieldRow label="X (px)">
        <Slider
          min={0}
          max={maxX}
          step={1}
          value={item.position?.[0] ?? 0}
          onChange={(v) => update({ position: [Number(v) || 0, item.position?.[1] ?? 0] })}
          tooltip={{ formatter: (v) => `${v ?? 0}px` }}
        />
      </FieldRow>
      <FieldRow label="Y (px)">
        <Slider
          min={0}
          max={maxY}
          step={1}
          value={item.position?.[1] ?? 0}
          onChange={(v) => update({ position: [item.position?.[0] ?? 0, Number(v) || 0] })}
          tooltip={{ formatter: (v) => `${v ?? 0}px` }}
        />
      </FieldRow>
    </div>
  )
}

export default SubtitleEditor
