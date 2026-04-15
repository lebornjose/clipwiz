import { Input, InputNumber } from 'antd'
import type { ISubtitleTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow, Section } from './FieldRow'

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

const SubtitleEditor = ({ item }: Props) => {
  const { updateTrackItemById } = useEditorStore()
  const update = (patch: Partial<ISubtitleTrackItem>) => updateTrackItemById(item.id, patch)

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
        <Input size="small" value={item.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })} />
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
        <InputNumber size="small" min={0} max={20} value={item.strokeWidth}
          onChange={(v) => update({ strokeWidth: v ?? 0 })} style={{ width: '100%' }} />
      </FieldRow>

      <Section title="位置" />
      <FieldRow label="X (px)">
        <InputNumber size="small" value={item.position?.[0]}
          onChange={(v) => update({ position: [v ?? 0, item.position?.[1] ?? 0] })}
          style={{ width: '100%' }} />
      </FieldRow>
      <FieldRow label="Y (px)">
        <InputNumber size="small" value={item.position?.[1]}
          onChange={(v) => update({ position: [item.position?.[0] ?? 0, v ?? 0] })}
          style={{ width: '100%' }} />
      </FieldRow>
    </div>
  )
}

export default SubtitleEditor
