import { Editor } from '@clipwiz/videoPlayer'
import trackInfo from '../../mock'
import { useEffect, useRef, useState } from 'react'
import VideoControls from './VideoControls'
import './index.less'
import { eventBus } from '../../utils'

const VideoPlayer = () => {
  const editorRef = useRef<Editor | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const initializedRef = useRef(false)  // ✅ 添加初始化标志
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // ✅ 如果已经初始化过，直接返回
    if (!canvasRef.current || initializedRef.current) {
      console.log('跳过重复初始化')
      return
    }


    const editor = new Editor({
      canvas: canvasRef.current,
      trackInfo,
      setState: (state: any) => {
        console.log('Editor state:', state)
      },
      setProgress: (time: number) => {
        console.log('setProgress', time)
        setCurrentTime(time)
      },
    })

    editorRef.current = editor
    initializedRef.current = true  // ✅ 标记已初始化
    setDuration(trackInfo.duration / 1000) // 转换为秒

  }, [])

  // 播放/暂停
  const togglePlay = () => {
    if (!editorRef.current) return

    if (isPlaying) {
      editorRef.current.pause()
      eventBus.emit('video:pause')
    } else {
      editorRef.current.play()
      eventBus.emit('video:play')
    }
    setIsPlaying(!isPlaying)
  }

  // 音量控制
  const handleVolumeChange = (value: number) => {
    if (!editorRef.current) return
    setVolume(value)
    editorRef.current.setVolume(value)
    if (value === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // 静音切换
  const toggleMute = () => {
    if (!editorRef.current) return

    if (isMuted) {
      setIsMuted(false)
      setVolume(1)
      editorRef.current.setVolume(1)
    } else {
      setIsMuted(true)
      editorRef.current.setVolume(0)
    }
  }

  // 进度条拖动
  const handleProgressChange = (value: number) => {
    if (!editorRef.current) return
    setCurrentTime(value)
    editorRef.current.seek(value)
    // editorRef.current.setProcess(value)
  }

  // 全屏
  const handleFullscreen = () => {
    const container = document.querySelector('.video-player-container') as HTMLElement
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className='video-player-container'>
      <div className='video-wrapper'>
        <canvas ref={canvasRef} className='video-canvas' width={1280} height={720} style={{ width: '852px', height: '480px' }}></canvas>

        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={togglePlay}
          onProgressChange={handleProgressChange}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onFullscreen={handleFullscreen}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
