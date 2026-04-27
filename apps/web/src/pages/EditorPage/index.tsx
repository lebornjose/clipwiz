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
import { prepareTrackInfoWithPagPrerender } from '../../utils/pagPrerender'
import '../../App.css'

const { Header } = Layout
const COVER_CAPTURE_DELAY_MS = 80

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

  const uploadProjectCover = useCallback(async () => {
    if (!id) return null

    const canvas = document.querySelector('.video-canvas') as HTMLCanvasElement | null
    if (!canvas) return null

    await new Promise((resolve) => window.setTimeout(resolve, COVER_CAPTURE_DELAY_MS))

    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((result) => resolve(result), 'image/png')
      } catch {
        resolve(null)
      }
    })

    if (!blob) return null

    const formData = new FormData()
    formData.append('file', blob, `project-cover-${id}.png`)

    const res = await fetch(`/api/project/${id}/cover`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (data.code !== 200) {
      throw new Error(data.message || '封面上传失败')
    }

    return data.data as { coverUrl: string; coverOssKey: string }
  }, [id])

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
  const handleSave = useCallback(async (options?: { silent?: boolean }) => {
    if (!id || !trackInfo) return false
    setSaving(true)
    try {
      let coverPayload: { coverUrl: string; coverOssKey: string } | null = null

      try {
        coverPayload = await uploadProjectCover()
      } catch (error) {
        console.warn('Project cover capture/upload failed:', error)
      }

      await PUT(`/api/project/${id}`, {
        title: projectTitle,
        protocol: trackInfo,
        ...(coverPayload ?? {}),
      })

      if (!options?.silent) {
        if (coverPayload) {
          message.success('保存成功', 2)
        } else {
          message.warning('项目已保存，封面生成失败', 2)
        }
      }

      return true
    } catch {
      if (!options?.silent) {
        message.error('保存失败')
      }
      return false
    } finally {
      setSaving(false)
    }
  }, [id, trackInfo, projectTitle, uploadProjectCover])

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
    const saved = await handleSave({ silent: true })
    if (!saved) {
      message.error('保存失败，已取消导出')
      return
    }
    const hideLoading = message.loading('正在预渲染字幕并导出，请稍候...', 0)
    try {
      const exportTrackInfo = await prepareTrackInfoWithPagPrerender(trackInfo, (done, total) => {
        message.open({
          key: 'export-prerender-progress',
          type: 'loading',
          content: `字幕预渲染中 ${done}/${total}`,
          duration: 0,
        })
      })
      message.destroy('export-prerender-progress')
      const data = await POST('/api/graph', { trackInfo: exportTrackInfo })
      const url = data.data.downloadUrl
      downloadFile(url, 'exported-video.mp4')
      message.success('导出视频成功')
    } catch (error: any) {
      message.destroy('export-prerender-progress')
      message.error(error?.message || '导出失败')
    } finally {
      hideLoading()
    }
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
