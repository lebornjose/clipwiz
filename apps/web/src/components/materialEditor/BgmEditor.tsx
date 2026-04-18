import { Slider, Typography } from 'antd'
import { useMemo } from 'react'
import type { IAudioTrackItem } from '@clipwiz/shared'
import { useEditorStore } from '../../store/editorStore'
import { FieldRow, Section } from './FieldRow'
import { eventBus } from '../../utils'

interface Props {
  item: IAudioTrackItem
}

const { Text } = Typography

const formatSeconds = (ms: number) => (ms / 1000).toFixed(2)

const BgmEditor = ({ item }: Props) => {
  const { updateTrackItemById } = useEditorStore()
  const update = (patch: Partial<IAudioTrackItem>) => updateTrackItemById(item.id, patch)
  const updateAndSync = (patch: Partial<IAudioTrackItem>) => {
    update(patch)
    eventBus.emit('audio:update', { id: item.id, patch })
  }
  const playRate = item.playRate ?? 1

  const clipDurationMs = Math.max(0, item.endTime - item.startTime)
  const sourceDurationMs = Math.max(0, item.toTime - item.fromTime)
  const fadeMaxMs = Math.floor(clipDurationMs / 2)

  const effectiveFadeIn = useMemo(() => Math.min(item.fadeIn ?? 0, fadeMaxMs), [item.fadeIn, fadeMaxMs])
  const effectiveFadeOut = useMemo(() => Math.min(item.fadeOut ?? 0, fadeMaxMs), [item.fadeOut, fadeMaxMs])

  const handleVolumeChange = (value: number) => {
    const volume = Math.max(0, Math.min(1, value))
    updateAndSync({
      volume,
      muted: volume === 0,
    })
  }

  const handlePlayRateChange = (value: number) => {
    const nextRate = Math.max(0.5, Math.min(2, value))
    updateAndSync({
      playRate: nextRate,
      // 倍速不改变时间轴区间：startTime/endTime 保持不变
      fadeIn: Math.min(item.fadeIn ?? 0, fadeMaxMs),
      fadeOut: Math.min(item.fadeOut ?? 0, fadeMaxMs),
    })
  }

  return (
    <div className="material-editor__fields">
      <Section title="音频" />
      <FieldRow label="音量">
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={item.volume ?? 1}
          onChange={handleVolumeChange}
          tooltip={{ formatter: (v) => `${Math.round((v ?? 0) * 100)}%` }}
        />
      </FieldRow>

      <Section title="播放" />
      <FieldRow label="倍速">
        <Slider
          min={0.5}
          max={2}
          step={0.05}
          value={playRate}
          onChange={handlePlayRateChange}
          marks={{ 0.5: '0.5x', 1: '1x', 2: '2x' }}
          tooltip={{ formatter: (v) => `${(v ?? 1).toFixed(2)}x` }}
        />
      </FieldRow>
      <FieldRow label="时长信息">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text type="secondary">素材截取: {formatSeconds(sourceDurationMs)}s</Text>
          <Text type="secondary">轨道时长: {formatSeconds(clipDurationMs)}s</Text>
        </div>
      </FieldRow>

      <Section title="淡化" />
      <FieldRow label="淡入">
        <Slider
          min={0}
          max={fadeMaxMs}
          step={10}
          value={effectiveFadeIn}
          onChange={(v) => updateAndSync({ fadeIn: Math.max(0, Math.min(fadeMaxMs, v)) })}
          tooltip={{ formatter: (v) => `${formatSeconds(v ?? 0)}s` }}
        />
      </FieldRow>
      <FieldRow label="淡出">
        <Slider
          min={0}
          max={fadeMaxMs}
          step={10}
          value={effectiveFadeOut}
          onChange={(v) => updateAndSync({ fadeOut: Math.max(0, Math.min(fadeMaxMs, v)) })}
          tooltip={{ formatter: (v) => `${formatSeconds(v ?? 0)}s` }}
        />
      </FieldRow>
    </div>
  )
}

export default BgmEditor
