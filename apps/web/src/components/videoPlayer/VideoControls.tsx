import { Button, Slider } from 'antd'
import {
  PlayCircleFilled,
  PauseCircleFilled,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundFilled,
  SoundOutlined,
  CameraOutlined,
  ScissorOutlined,
  ExpandOutlined,
} from '@ant-design/icons'
import './VideoControls.less'

interface VideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  aspectRatioLabel?: string
  onPlayPause: () => void
  onProgressChange: (value: number) => void
  onVolumeChange: (value: number) => void
  onToggleMute: () => void
}

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  aspectRatioLabel = '16:9',
  onPlayPause,
  onProgressChange,
  onVolumeChange,
  onToggleMute,
}: VideoControlsProps) => {
  // 格式化时间 (秒 -> MM:SS:FF) - 按照25帧率
  const formatTime = (seconds: number) => {
    const FPS = 25 // 帧率

    const mins = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const secs = Math.floor(remainingSeconds)
    const frames = Math.floor((remainingSeconds - secs) * FPS)

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  // 上一帧
  const handlePrevFrame = () => {
    const frameTime = 1 / 25 // 一帧的时间（秒）
    const newTime = Math.max(0, currentTime - frameTime)
    onProgressChange(newTime)
  }

  // 下一帧
  const handleNextFrame = () => {
    const frameTime = 1 / 25
    const newTime = Math.min(duration, currentTime + frameTime)
    onProgressChange(newTime)
  }

  return (
    <div className='video-controls'>
      <div className='progress-bar-container'>
        <Slider
          className='progress-bar'
          min={0}
          max={duration || 100}
          step={0.04} // 一帧的精度（1/25）
          value={currentTime}
          onChange={onProgressChange}
          tooltip={{ formatter: (value) => formatTime(value || 0) }}
        />
      </div>

      <div className='controls-bar'>
        <div className='controls-left'>
          <div className='time-display'>
            <span className='time-current'>{formatTime(currentTime)}</span>
            <span className='time-divider'>|</span>
            <span className='time-total'>{formatTime(duration)}</span>
          </div>
        </div>

        <div className='controls-center'>
          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<StepBackwardOutlined style={{ fontSize: 16 }} />}
            onClick={handlePrevFrame}
          />

          <Button
            type='text'
            size='small'
            className='control-btn play-btn'
            icon={
              isPlaying ? (
                <PauseCircleFilled style={{ fontSize: 24 }} />
              ) : (
                <PlayCircleFilled style={{ fontSize: 24 }} />
              )
            }
            onClick={onPlayPause}
          />

          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<StepForwardOutlined style={{ fontSize: 16 }} />}
            onClick={handleNextFrame}
          />
        </div>

        <div className='controls-right'>
          <div className='volume-control-compact'>
            <Button
              type='text'
              size='small'
              className='control-btn'
              icon={
                isMuted || volume === 0 ? (
                  <SoundOutlined style={{ fontSize: 16 }} />
                ) : (
                  <SoundFilled style={{ fontSize: 16 }} />
                )
              }
              onClick={onToggleMute}
            />
            <div className='volume-slider-popup'>
              <Slider
                vertical
                className='volume-slider'
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={onVolumeChange}
                tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
              />
            </div>
          </div>

          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<ScissorOutlined style={{ fontSize: 16 }} />}
          />
          <span className='ratio-pill'>{aspectRatioLabel}</span>
          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<CameraOutlined style={{ fontSize: 16 }} />}
          />
          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<ExpandOutlined style={{ fontSize: 16 }} />}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoControls
