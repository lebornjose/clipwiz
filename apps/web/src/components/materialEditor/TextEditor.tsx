import { Input } from 'antd'
import type { ITextTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow } from './FieldRow'

interface Props {
  item: ITextTrackItem
}

const TextEditor = ({ item }: Props) => {
  const { updateTrackItemById } = useEditorStore()
  const update = (patch: Partial<ITextTrackItem>) => updateTrackItemById(item.id, patch)

  return (
    <div className="material-editor__fields">
      <FieldRow label="花字文本">
        <Input
          size="small"
          value={item.text}
          onChange={(e) => update({ text: e.target.value })}
        />
      </FieldRow>

      <FieldRow label="素材地址">
        <Input
          size="small"
          value={(item as any).url ?? ''}
          onChange={(e) => update({ url: e.target.value } as any)}
        />
      </FieldRow>
    </div>
  )
}

export default TextEditor
