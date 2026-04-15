import { InputNumber, Input } from 'antd'
import type { TransitionItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow } from './FieldRow'

interface Props {
  transition: TransitionItem
}

const TransitionEditor = ({ transition }: Props) => {
  const { updateSelectedTransition } = useEditorStore()

  return (
    <div className="material-editor__fields">
      <FieldRow label="转场名称">
        <Input
          size="small"
          value={transition.desc || transition.name}
          readOnly
          variant="borderless"
          style={{ color: 'var(--color-on-surface-variant)', padding: 0 }}
        />
      </FieldRow>

      <FieldRow label="效果 ID">
        <Input
          size="small"
          value={transition.effectId}
          readOnly
          variant="borderless"
          style={{ color: 'var(--color-on-surface-variant)', padding: 0 }}
        />
      </FieldRow>

      <FieldRow label="时长 (ms)">
        <InputNumber
          size="small"
          min={100} max={5000} step={100}
          value={transition.duration}
          onChange={(v) => updateSelectedTransition({ duration: v ?? 500 })}
          style={{ width: '100%' }}
        />
      </FieldRow>
    </div>
  )
}

export default TransitionEditor
