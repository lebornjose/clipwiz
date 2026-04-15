import { Input, InputNumber } from 'antd'
import type { IPhotoTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow, Section } from './FieldRow'

interface Props {
  item: IPhotoTrackItem
}

const PhotoEditor = ({ item }: Props) => {
  const { updateTrackItemById } = useEditorStore()
  const update = (patch: Partial<IPhotoTrackItem>) => updateTrackItemById(item.id, patch)

  const transform = item.transform ?? { scale: [1, 1, 1], rotate: [0, 0, 0], translate: [0, 0, 0] }

  return (
    <div className="material-editor__fields">
      <Section title="基本" />
      <FieldRow label="描述">
        <Input size="small" value={item.desc}
          onChange={(e) => update({ desc: e.target.value })} />
      </FieldRow>

      <Section title="缩放" />
      <FieldRow label="X">
        <InputNumber size="small" min={0.01} step={0.1} value={transform.scale[0]}
          onChange={(v) => update({ transform: { ...transform, scale: [v ?? 1, transform.scale[1], transform.scale[2]] } })}
          style={{ width: '100%' }} />
      </FieldRow>
      <FieldRow label="Y">
        <InputNumber size="small" min={0.01} step={0.1} value={transform.scale[1]}
          onChange={(v) => update({ transform: { ...transform, scale: [transform.scale[0], v ?? 1, transform.scale[2]] } })}
          style={{ width: '100%' }} />
      </FieldRow>

      <Section title="旋转" />
      <FieldRow label="Z (°)">
        <InputNumber size="small" min={-360} max={360} step={1} value={transform.rotate[2]}
          onChange={(v) => update({ transform: { ...transform, rotate: [transform.rotate[0], transform.rotate[1], v ?? 0] } })}
          style={{ width: '100%' }} />
      </FieldRow>

      <Section title="位移" />
      <FieldRow label="X">
        <InputNumber size="small" step={0.01} value={transform.translate[0]}
          onChange={(v) => update({ transform: { ...transform, translate: [v ?? 0, transform.translate[1], transform.translate[2]] } })}
          style={{ width: '100%' }} />
      </FieldRow>
      <FieldRow label="Y">
        <InputNumber size="small" step={0.01} value={transform.translate[1]}
          onChange={(v) => update({ transform: { ...transform, translate: [transform.translate[0], v ?? 0, transform.translate[2]] } })}
          style={{ width: '100%' }} />
      </FieldRow>
    </div>
  )
}

export default PhotoEditor
