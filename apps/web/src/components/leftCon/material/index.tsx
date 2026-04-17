import { useRef, useState } from 'react'
import { Tag, Tooltip, message, Spin } from 'antd'
import {
  VideoCameraOutlined,
  FileImageOutlined,
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { useInfiniteList } from '../../../hooks/useInfiniteList'
import { useEditorStore } from '../../../store/editorStore'
import './index.less'

interface Material {
  _id: string
  name: string
  url: string
  type: 'video' | 'image'
  duration?: number
  width?: number
  height?: number
  size: number
}

const ossVideoThumbnail = (url: string) =>
  `${url}?x-oss-process=video/snapshot,t_0,w_320,h_180`

const API = '/api/material'

const formatDuration = (ms?: number) => {
  if (!ms) return ''
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const MaterialList = () => {
  const { items: materials, loading, hasMore, sentinelRef, refresh } =
    useInfiniteList<Material>(API, { limit: 20 })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const addVideoMaterial = useEditorStore((s) => s.addVideoMaterial)

  const handleAddToTrack = (m: Material, e: React.MouseEvent) => {
    e.stopPropagation()
    addVideoMaterial({
      url: m.url,
      type: m.type,
      duration: m.duration,
      name: m.name,
      width: m.width,
      height: m.height,
      materialId: m._id,
    })
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
      const res = JSON.parse(xhr.responseText)
      if (res.code === 200) { message.success('上传成功'); refresh() }
      else message.error(res.message || '上传失败')
    })
    xhr.addEventListener('error', () => { setUploading(false); message.error('上传失败') })
    xhr.open('POST', `${API}/upload`)
    xhr.send(formData)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    fetch(`${API}/${id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 200) { message.success('已删除'); refresh() }
      })
      .catch(() => message.error('删除失败'))
  }

  return (
    <div
      className="material-con"
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className={`material-upload-btn ${uploading ? 'is-uploading' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading ? <><LoadingOutlined /><span>{uploadProgress}%</span></> : <><PlusOutlined /><span>上传素材</span></>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
      />

      <div className="material-list">
        {materials.map((m) => (
          <Tooltip key={m._id} title={m.name} placement="bottom" mouseEnterDelay={0.6}>
            <div className="material-list-item" onClick={(e) => handleAddToTrack(m, e)}>
              <div className="material-list-item-img">
                <img
                  src={m.type === 'video' ? ossVideoThumbnail(m.url) : m.url}
                  alt={m.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                {m.type === 'video' && m.duration && (
                  <span className="material-list-item-duration">{formatDuration(m.duration)}</span>
                )}
              </div>
              <div className="material-list-item-name">{m.name}</div>
              <Tag icon={m.type === 'video' ? <VideoCameraOutlined /> : <FileImageOutlined />}>
                {m.type === 'video' ? '视频' : '图片'}
              </Tag>
              <button className="material-list-item-add" onClick={(e) => handleAddToTrack(m, e)}>
                <PlusOutlined />
              </button>
              <button className="material-list-item-delete" onClick={(e) => handleDelete(m._id, e)}>
                <DeleteOutlined />
              </button>
            </div>
          </Tooltip>
        ))}

        {materials.length === 0 && !loading && (
          <div className="material-empty">拖拽文件或点击上传按钮添加素材</div>
        )}
      </div>

      <div ref={sentinelRef} className="list-sentinel">
        {loading && <Spin size="small" />}
        {!hasMore && materials.length > 0 && <span className="list-end-text">已加载全部</span>}
      </div>
    </div>
  )
}

export default MaterialList
