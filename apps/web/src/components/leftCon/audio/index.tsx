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
import { useInfiniteList } from '../../../hooks/useInfiniteList'
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
    console.log('添加音频到时间轴:', item)
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
          : <><UploadOutlined /><span>上传音频</span></>}
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
          <div className="audio-empty">暂无音频，点击上传按钮添加</div>
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
