import { Button, Slider } from 'antd'
import {
  PlayCircleFilled,
  PauseCircleFilled,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundFilled,
  SoundOutlined,
  ExpandOutlined,
} from '@ant-design/icons'
import './VideoControls.less'

interface VideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
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
      {/* 进度条 */}
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

      {/* 控制按钮区域 */}
      <div className='controls-bar'>
        {/* 左侧：时间显示 */}
        <div className='controls-left'>
          <div className='time-display-compact'>
            <span className='current-time'>{formatTime(currentTime)}</span>
            <span className='time-separator'>|</span>
            <span className='total-time'>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 中间：播放控制 */}
        <div className='controls-center'>
          {/* 上一帧 */}
          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<StepBackwardOutlined style={{ fontSize: 16 }} />}
            onClick={handlePrevFrame}
          />

          {/* 播放/暂停 */}
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

          {/* 下一帧 */}
          <Button
            type='text'
            size='small'
            className='control-btn'
            icon={<StepForwardOutlined style={{ fontSize: 16 }} />}
            onClick={handleNextFrame}
          />
        </div>

        {/* 右侧：工具按钮 */}
        <div className='controls-right'>
          {/* 音量控制 */}
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

          {/* 全屏 */}
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

