import { useState, useRef, useEffect } from 'react'
import { Layout, Button, message } from 'antd'
import { ScissorOutlined, DownloadOutlined } from '@ant-design/icons'
import LeftCon from './components/leftCon'
import TimeLine from './components/timeLine'
import VideoPlayer from './components/videoPlayer'
import './App.css'

const { Header } = Layout

function App() {
  const [timelineHeight, setTimelineHeight] = useState(300) // 默认时间轴高度
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    // 禁用文本选择
    document.body.style.userSelect = 'none'
  }

  // 处理拖动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      // 使用 requestAnimationFrame 优化性能
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const bottomPosition = containerRect.bottom
        const newHeight = bottomPosition - e.clientY

        // 限制最小和最大高度
        const minHeight = 150
        const maxHeight = containerRect.height - 300 // 预留至少 300px 给 VideoPlayer

        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setTimelineHeight(newHeight)
        }
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      // 恢复文本选择
      document.body.style.userSelect = ''
      // 清理 RAF
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
      // 清理 RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isDragging])

  const handleExportVideo = () => {
    fetch('/api/graph',
      {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    message.success('导出视频成功')
  }

  return (
    <Layout style={{ minHeight: '100vh' }} ref={containerRef}>
      <Header style={{
        background: '#001529',
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className='header-left'>
          <ScissorOutlined style={{ marginRight: '12px' }} />
          ClipWiz 视频编辑器
        </div>

        <div className='header-right'>
          <Button icon={<DownloadOutlined />} type="primary" size="small" onClick={() => handleExportVideo()}>
            导出视频
          </Button>
        </div>
      </Header>

      <Layout
        className={`app-layout ${isDragging ? 'dragging' : ''}`}
        style={{
          height: `calc(100vh - 64px - ${timelineHeight}px)`, // 减去 Header 高度和 TimeLine 高度
          overflow: 'hidden'
        }}
      >
        <LeftCon />
        <VideoPlayer />
      </Layout>

      {/* 可拖动的分隔条 */}
      <div
        className={`timeline-resizer ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resizer-handle" />
      </div>

      {/* TimeLine 区域 */}
      <div style={{ height: `${timelineHeight}px`, overflow: 'hidden' }}>
        <TimeLine />
      </div>
    </Layout>
  )
}

export default App

