import { Editor } from '@clipwiz/videoPlayer'
import { useEffect, useRef, useState } from 'react'
import VideoControls from './VideoControls'
import './index.less'
import { eventBus } from '../../utils'
import { useEditorStore } from '../../store/editorStore'

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

const VideoPlayer = () => {
  const editorRef = useRef<Editor | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isPlayingRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const { trackInfo, trackInfoVersion } = useEditorStore()

  // Wire time:update once (editorRef is always current via ref)
  useEffect(() => {
    const onTimeUpdate = (time: number) => {
      editorRef.current?.seek(time)
    }
    eventBus.on('time:update', onTimeUpdate)
    return () => eventBus.off('time:update', onTimeUpdate)
  }, [])

  // Reinitialize editor whenever the committed protocol version changes
  useEffect(() => {
    if (!canvasRef.current || !trackInfo) return

    // Destroy previous editor
    if (editorRef.current) {
      try { (editorRef.current.videoCtx as any).destroy() } catch { /* ignore */ }
      editorRef.current = null
    }

    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(trackInfo.duration / 1000)

    // Spread tracks into a new array so the Editor's in-place .reverse() call
    // does not mutate the shared store object.
    const editor = new Editor({
      canvas: canvasRef.current,
      trackInfo: { ...trackInfo, tracks: [...trackInfo.tracks] },
      setState: () => { /* intentionally empty */ },
      setProgress: (time: number) => {
        setCurrentTime(time)
        const totalDuration = trackInfo.duration / 1000
        if (isPlayingRef.current && time >= totalDuration) {
          isPlayingRef.current = false
          setIsPlaying(false)
          eventBus.emit('video:pause')
        }
      },
    })

    editorRef.current = editor
  }, [trackInfoVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // 播放/暂停
  const togglePlay = () => {
    if (!editorRef.current) return

    if (isPlaying) {
      isPlayingRef.current = false
      editorRef.current.pause()
      eventBus.emit('video:pause')
    } else {
      isPlayingRef.current = true
      // 若已播放到末尾，先将时间轴游标归零，再开始播放
      if (currentTime >= duration) {
        setCurrentTime(0)
        eventBus.emit('video:seek', 0)
      }
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
    eventBus.emit('video:seek', value);
    // editorRef.current.setProcess(value)
  }

  const width = trackInfo?.width ?? 1280
  const height = trackInfo?.height ?? 720
  const ratio = gcd(width, height)
  const aspectRatioLabel = `${width / ratio}:${height / ratio}`

  return (
    <div className='video-player-container'>
      <div className='video-wrapper'>
        <div className='video-stage'>
          <div
            className='video-frame'
            style={{ aspectRatio: `${width} / ${height}` }}
          >
            <canvas
              ref={canvasRef}
              className='video-canvas'
              width={width}
              height={height}
            />
          </div>
        </div>

        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          aspectRatioLabel={aspectRatioLabel}
          onPlayPause={togglePlay}
          onProgressChange={handleProgressChange}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
