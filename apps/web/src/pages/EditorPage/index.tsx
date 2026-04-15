import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Button, message, Input, Tooltip } from 'antd'
import {
  ScissorOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import LeftCon from '../../components/leftCon'
import TimeLine from '../../components/timeLine'
import VideoPlayer from '../../components/videoPlayer'
import MaterialEditor from '../../components/materialEditor'
import { POST, GET, PUT, downloadFile } from '../../utils'
import { useEditorStore } from '../../store/editorStore'
import { useShortcuts } from '../../hooks/useShortcuts'
import '../../App.css'

const { Header } = Layout

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    setTrackInfo,
    trackInfo,
    deleteSelectedAction,
    deleteSelectedTransition,
    selectedTransitionKey,
  } = useEditorStore()

  const [projectTitle, setProjectTitle] = useState('')
  const [titleEditing, setTitleEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timelineHeight, setTimelineHeight] = useState(300)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  // 加载项目
  useEffect(() => {
    if (!id) return
    setLoading(true)
    GET(`/api/project/${id}`)
      .then((res) => {
        setProjectTitle(res.data.title)
        setTrackInfo(res.data.protocol)
      })
      .catch(() => {
        message.error('加载项目失败')
        navigate('/')
      })
      .finally(() => setLoading(false))
  }, [id, navigate, setTrackInfo])

  // 保存项目
  const handleSave = useCallback(async () => {
    if (!id || !trackInfo) return
    setSaving(true)
    try {
      await PUT(`/api/project/${id}`, { title: projectTitle, protocol: trackInfo })
      message.success('保存成功', 2)
    } catch {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }, [id, trackInfo, projectTitle])

  const handleDelete = useCallback(() => {
    if (selectedTransitionKey) {
      deleteSelectedTransition()
    } else {
      deleteSelectedAction()
    }
  }, [selectedTransitionKey, deleteSelectedTransition, deleteSelectedAction])

  // 快捷键
  useShortcuts([
    { key: 'Delete', handler: handleDelete, description: '删除选中素材或转场' },
    { key: 'Backspace', handler: handleDelete, description: '删除选中素材或转场' },
    { key: 's', ctrl: true, handler: handleSave, description: '保存项目' },
  ])

  // 标题失焦保存
  const handleTitleBlur = async () => {
    setTitleEditing(false)
    if (!id || !projectTitle.trim()) return
    try {
      await PUT(`/api/project/${id}`, { title: projectTitle.trim() })
    } catch {
      // silent
    }
  }

  // 拖动分隔条
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return
        const containerRect = containerRef.current.getBoundingClientRect()
        const newHeight = containerRect.bottom - e.clientY
        const minHeight = 150
        const maxHeight = containerRect.height - 300
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setTimelineHeight(newHeight)
        }
      })
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = ''
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isDragging])

  const handleExportVideo = async () => {
    if (!trackInfo) return
    const data = await POST('/api/graph', { trackInfo })
    const url = data.data.downloadUrl
    downloadFile(url, 'exported-video.mp4')
    message.success('导出视频成功')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--color-on-surface-variant)',
        background: 'var(--color-surface)',
      }}>
        加载中...
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }} ref={containerRef}>
      <Header className="app-header">
        <div className="header-left">
          <Tooltip title="返回首页">
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
            />
          </Tooltip>
          <ScissorOutlined />
          {titleEditing ? (
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onPressEnter={handleTitleBlur}
              size="small"
              autoFocus
              style={{ width: 200 }}
            />
          ) : (
            <span
              className="editor-page__title"
              onClick={() => setTitleEditing(true)}
              title="点击编辑标题"
            >
              {projectTitle}
            </span>
          )}
        </div>
        <div className="header-right">
          <Button
            icon={<SaveOutlined />}
            size="small"
            loading={saving}
            onClick={handleSave}
          >
            保存
          </Button>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            size="small"
            onClick={handleExportVideo}
          >
            导出视频
          </Button>
        </div>
      </Header>

      <Layout
        className={`app-layout ${isDragging ? 'dragging' : ''}`}
        style={{
          height: `calc(100vh - var(--layout-header-height) - ${timelineHeight}px)`,
          overflow: 'hidden',
        }}
      >
        <LeftCon />
        <VideoPlayer />
        <MaterialEditor />
      </Layout>

      <div
        className={`timeline-resizer ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resizer-handle" />
      </div>

      <div style={{ height: `${timelineHeight}px`, overflow: 'hidden' }}>
        <TimeLine />
      </div>
    </Layout>
  )
}
