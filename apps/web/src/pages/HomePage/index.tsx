import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Modal,
  message,
  Empty,
  Typography,
  Popconfirm,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  FolderOpenOutlined,
  DeleteOutlined,
  ScissorOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { GET, POST, DELETE, PUT } from '../../utils'
import defaultProtocol from '../../mock'
import './index.less'

const { Text } = Typography

interface Project {
  _id: string
  title: string
  createdAt: string
  updatedAt: string
}

const BASE = '/api/project'

export default function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [renameVisible, setRenameVisible] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [renameTarget, setRenameTarget] = useState<Project | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GET(BASE)
      setProjects(res.data)
    } catch {
      message.error('加载项目列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      message.warning('请输入项目标题')
      return
    }
    setCreating(true)
    try {
      const res = await POST(BASE, { title: newTitle.trim(), protocol: defaultProtocol })
      message.success('项目创建成功')
      setCreateVisible(false)
      setNewTitle('')
      navigate(`/editor/${res.data._id}`)
    } catch {
      message.error('创建失败，请重试')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await DELETE(`${BASE}/${id}`)
      message.success('删除成功')
      setProjects((prev) => prev.filter((p) => p._id !== id))
    } catch {
      message.error('删除失败')
    }
  }

  const handleRename = async () => {
    if (!renameTarget || !newTitle.trim()) return
    try {
      await PUT(`${BASE}/${renameTarget._id}`, { title: newTitle.trim() })
      message.success('重命名成功')
      setProjects((prev) =>
        prev.map((p) => (p._id === renameTarget._id ? { ...p, title: newTitle.trim() } : p))
      )
      setRenameVisible(false)
      setRenameTarget(null)
      setNewTitle('')
    } catch {
      message.error('重命名失败')
    }
  }

  const openRename = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setRenameTarget(project)
    setNewTitle(project.title)
    setRenameVisible(true)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="home-page">
      <header className="home-page__header">
        <div className="home-page__logo">
          <ScissorOutlined />
          <span>ClipWiz</span>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            setNewTitle('')
            setCreateVisible(true)
          }}
        >
          新建项目
        </Button>
      </header>

      <main className="home-page__main">
        <h2 className="home-page__section-title">我的项目</h2>

        {loading ? (
          <div className="home-page__loading">加载中...</div>
        ) : projects.length === 0 ? (
          <Empty
            description={<span className="text-muted">暂无项目，点击右上角新建</span>}
            className="home-page__empty"
          />
        ) : (
          <div className="home-page__grid">
            {projects.map((project) => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => navigate(`/editor/${project._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/editor/${project._id}`)}
              >
                <div className="project-card__thumb">
                  <FolderOpenOutlined className="project-card__thumb-icon" />
                </div>
                <div className="project-card__body">
                  <div className="project-card__title-row">
                    <Text className="project-card__title" ellipsis={{ tooltip: project.title }}>
                      {project.title}
                    </Text>
                    <div className="project-card__actions">
                      <Tooltip title="重命名">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => openRename(e, project)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确认删除该项目？"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={(e) => {
                          e?.stopPropagation()
                          handleDelete(project._id)
                        }}
                        onPopupClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="删除">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  </div>
                  <div className="project-card__meta">
                    <Text className="project-card__date">修改于 {formatDate(project.updatedAt)}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 新建项目弹窗 */}
      <Modal
        title="新建项目"
        open={createVisible}
        onOk={handleCreate}
        onCancel={() => setCreateVisible(false)}
        okText="创建"
        cancelText="取消"
        confirmLoading={creating}
        width={480}
      >
        <Input
          placeholder="请输入项目标题"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleCreate}
          autoFocus
          size="small"
          style={{ marginTop: 8 }}
        />
      </Modal>

      {/* 重命名弹窗 */}
      <Modal
        title="重命名项目"
        open={renameVisible}
        onOk={handleRename}
        onCancel={() => {
          setRenameVisible(false)
          setRenameTarget(null)
          setNewTitle('')
        }}
        okText="确认"
        cancelText="取消"
        width={480}
      >
        <Input
          placeholder="请输入新标题"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleRename}
          autoFocus
          size="small"
          style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  )
}
