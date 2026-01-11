import { useState } from 'react'
import { Layout, Button, message } from 'antd'
import { UploadOutlined, PlayCircleOutlined, ScissorOutlined, DownloadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import LeftCon from './components/leftCon'
import TimeLine from './components/timeLine'
import VideoPlayer from './components/videoPlayer'
import './App.css'

const { Header, Content, Sider } = Layout

function App() {
  const [videoUrl, setVideoUrl] = useState<string>('')

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    accept: 'video/*',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
        setVideoUrl(info.file.response?.url || '')
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
          <Button icon={<DownloadOutlined />} type="primary" size="small">
            导出视频
          </Button>
        </div>
      </Header>

      <Layout className='app-layout'>
        <LeftCon />

        <VideoPlayer />
      </Layout>
      <TimeLine />
    </Layout>
  )
}

export default App

