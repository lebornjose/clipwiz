import { useState } from 'react'
import { Layout, Button, Upload, Space, message } from 'antd'
import { UploadOutlined, PlayCircleOutlined, ScissorOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
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
        <ScissorOutlined style={{ marginRight: '12px' }} />
        ClipWiz 视频编辑器
      </Header>

      <Layout>
        <Sider width={250} style={{ background: '#fff', padding: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} block>
                上传视频
              </Button>
            </Upload>

            <Button icon={<PlayCircleOutlined />} block disabled={!videoUrl}>
              预览
            </Button>

            <Button type="primary" block disabled={!videoUrl}>
              导出视频
            </Button>
          </Space>

          <div style={{ marginTop: '30px' }}>
            <h3>工具栏</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block>裁剪</Button>
              <Button block>分割</Button>
              <Button block>添加文字</Button>
              <Button block>添加滤镜</Button>
              <Button block>添加音频</Button>
            </Space>
          </div>
        </Sider>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <div style={{
            background: '#000',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px'
          }}>
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            ) : (
              <div style={{ color: '#666', textAlign: 'center' }}>
                <UploadOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <p>请上传视频文件开始编辑</p>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '24px',
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            minHeight: '150px'
          }}>
            <h3>时间轴</h3>
            <div style={{
              border: '2px dashed #d9d9d9',
              padding: '40px',
              textAlign: 'center',
              color: '#999'
            }}>
              时间轴编辑器（可使用 Fabric.js 或其他库实现）
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

