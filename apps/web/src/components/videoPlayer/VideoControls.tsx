import { Button, Slider } from 'antd'
import {
  PlayCircleFilled,
  PauseCircleFilled,
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
  onFullscreen?: () => void
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
  onFullscreen,
}: VideoControlsProps) => {
  // 格式化时间 (秒 -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className='video-controls'>
      {/* 进度条 */}
      <div className='progress-bar-container'>
        <Slider
          className='progress-bar'
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={onProgressChange}
          tooltip={{ formatter: (value) => formatTime(value || 0) }}
        />
      </div>

      {/* 控制按钮区域 */}
      <div className='controls-bar'>
        {/* 左侧控制 */}
        <div className='controls-left'>
          {/* 播放/暂停按钮 */}
          <Button
            type='text'
            size='large'
            className='control-btn play-btn'
            icon={
              isPlaying ? (
                <PauseCircleFilled style={{ fontSize: 32 }} />
              ) : (
                <PlayCircleFilled style={{ fontSize: 32 }} />
              )
            }
            onClick={onPlayPause}
          />

          {/* 时间显示 */}
          <div className='time-display'>
            <span className='current-time'>{formatTime(currentTime)}</span>
            <span className='time-separator'>/</span>
            <span className='total-time'>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 右侧控制 */}
        <div className='controls-right'>
          {/* 音量控制 */}
          <div className='volume-control'>
            <Button
              type='text'
              className='control-btn volume-btn'
              icon={
                isMuted || volume === 0 ? (
                  <SoundOutlined style={{ fontSize: 20 }} />
                ) : (
                  <SoundFilled style={{ fontSize: 20 }} />
                )
              }
              onClick={onToggleMute}
            />
            <div className='volume-slider-container'>
              <Slider
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

          {/* 全屏按钮 */}
          {onFullscreen && (
            <Button
              type='text'
              className='control-btn fullscreen-btn'
              icon={<ExpandOutlined style={{ fontSize: 18 }} />}
              onClick={onFullscreen}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoControls

