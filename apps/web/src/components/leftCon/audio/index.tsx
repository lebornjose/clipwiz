import { useState, useEffect, useRef } from 'react'
import { Button, message, Spin } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { MATERIAL_TYPE } from '@clipwiz/shared'
import { useInfiniteList } from '../../../hooks/useInfiniteList'
import { useEditorStore } from '../../../store/editorStore'
import './index.less'

interface AudioItem {
  _id: string
  name: string
  url: string
  duration?: number
  source: 'preset' | 'user'
}

const API = '/api/audio'

const formatDuration = (ms?: number) => {
  if (!ms) return '00:00'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const AudioList = () => {
  const { items: audioList, loading, hasMore, sentinelRef, refresh } =
    useInfiniteList<AudioItem>(API, { limit: 20 })
  const addTrackItem = useEditorStore((s) => s.addTrackItem)
  const currentTime = useEditorStore((s) => s.currentTime)
  const trackInfo = useEditorStore((s) => s.trackInfo)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  const handlePlay = (item: AudioItem) => {
    if (playingId === item._id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(item.url)
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => { setPlayingId(null); message.error('播放失败') }
    audio.play()
    audioRef.current = audio
    setPlayingId(item._id)
  }

  const handleAdd = (item: AudioItem) => {
    if (!trackInfo) {
      message.warning('请先打开一个项目再添加音效')
      return
    }

    const startTime = Math.max(0, Math.floor(currentTime * 1000))
    const sourceDuration = Math.max(1000, item.duration ?? 10000)
    const endTime = Math.min(trackInfo.duration, startTime + sourceDuration)
    const timelineDuration = endTime - startTime

    if (timelineDuration <= 0) {
      message.warning('当前时间已在项目结尾，无法添加音效')
      return
    }

    addTrackItem(MATERIAL_TYPE.SOUND_AUDIO, {
      format: MATERIAL_TYPE.AUDIO,
      title: item.name,
      url: item.url,
      duration: sourceDuration,
      fromTime: 0,
      toTime: timelineDuration,
      startTime,
      endTime,
      playRate: 1,
      volume: 1,
      sound: 1,
      fadeIn: 0,
      fadeOut: 0,
      muted: false,
    })
    message.success('已添加到时间轴')
  }

  const handleDelete = (item: AudioItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingId === item._id) {
      audioRef.current?.pause()
      setPlayingId(null)
    }
    fetch(`${API}/${item._id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 200) { message.success('已删除'); refresh() }
      })
      .catch(() => message.error('删除失败'))
  }

  const handleUpload = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setUploadProgress(0)
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      setUploading(false)
      setUploadProgress(0)
      try {
        const res = JSON.parse(xhr.responseText)
        if (res.code === 200) { message.success('上传成功'); refresh() }
        else message.error(res.message || '上传失败')
      } catch { message.error('上传失败') }
    })
    xhr.addEventListener('error', () => { setUploading(false); message.error('上传失败') })
    xhr.open('POST', `${API}/upload`)
    xhr.send(formData)
  }

  return (
    <div className="audio-panel">
      <div
        className={`audio-upload-btn ${uploading ? 'is-uploading' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading
          ? <><LoadingOutlined /><span>{uploadProgress}%</span></>
          : <><UploadOutlined /><span>上传音效</span></>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.aac,.ogg,.flac,.m4a"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
      />

      <div className="audio-list">
        {audioList.map((item) => (
          <div
            key={item._id}
            className={`audio-item ${playingId === item._id ? 'is-playing' : ''}`}
          >
            <Button
              type="text"
              className="audio-item__play"
              icon={
                playingId === item._id
                  ? <PauseCircleOutlined style={{ fontSize: 30, color: 'var(--color-primary)' }} />
                  : <PlayCircleOutlined style={{ fontSize: 30, color: 'var(--color-on-surface-variant)' }} />
              }
              onClick={() => handlePlay(item)}
            />

            <div className="audio-item__info">
              <div className="audio-item__name">{item.name}</div>
              <div className="audio-item__duration">{formatDuration(item.duration)}</div>
            </div>

            <div className="audio-item__actions">
              {item.source === 'user' && (
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                  className="audio-item__delete"
                  onClick={(e) => handleDelete(item, e)}
                />
              )}
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                className="audio-item__add"
                onClick={() => handleAdd(item)}
              />
            </div>
          </div>
        ))}

        {audioList.length === 0 && !loading && (
          <div className="audio-empty">暂无音效，点击上传按钮添加</div>
        )}
      </div>

      <div ref={sentinelRef} className="list-sentinel">
        {loading && <Spin size="small" />}
        {!hasMore && audioList.length > 0 && <span className="list-end-text">已加载全部</span>}
      </div>
    </div>
  )
}

export default AudioList
