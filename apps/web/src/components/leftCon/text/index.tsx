import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Spin, message } from 'antd'
import { PlusOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useInfiniteList } from '../../../hooks/useInfiniteList'
import { useEditorStore } from '../../../store/editorStore'
import './index.less'

interface FontMaterial {
  _id: string
  elementId: string
  elementCode: string
  elementName: string
  coverImgPath: string
  originalUrl: string
  pagUrl: string
  supportMultiFont?: boolean
}

const API = '/api/font'

const TextList = () => {
  const { items, loading, hasMore, sentinelRef, refresh } =
    useInfiniteList<FontMaterial>(API, { limit: 20 })
  const addTextMaterial = useEditorStore((s) => s.addTextMaterial)
  const trackInfo = useEditorStore((s) => s.trackInfo)
  const autoSeedRef = useRef(false)
  const [autoSeeding, setAutoSeeding] = useState(false)

  const defaultPosition = useMemo<[number, number]>(() => {
    const width = trackInfo?.width ?? 1280
    const height = trackInfo?.height ?? 720
    return [Math.floor(width / 2), Math.floor(height * 0.82)]
  }, [trackInfo?.height, trackInfo?.width])

  const handleSeed = async () => {
    try {
      const res = await fetch(`${API}/seed`, { method: 'POST' }).then((r) => r.json())
      if (res?.code === 200) {
        message.success(`花字入库成功（${res.count}条）`)
        refresh()
      } else {
        message.error(res?.message || '花字入库失败')
      }
    } catch {
      message.error('花字入库失败')
    }
  }

  useEffect(() => {
    if (loading || items.length > 0 || autoSeedRef.current) return
    autoSeedRef.current = true
    setAutoSeeding(true)
    fetch(`${API}/seed`, { method: 'POST' })
      .then((r) => r.json())
      .then((res) => {
        if (res?.code === 200) refresh()
      })
      .finally(() => setAutoSeeding(false))
  }, [items.length, loading, refresh])

  const handleAdd = (item: FontMaterial, e: React.MouseEvent) => {
    e.stopPropagation()
    addTextMaterial({
      materialId: item.elementId,
      title: item.elementName,
      url: item.pagUrl,
      text: item.elementName,
      position: defaultPosition,
      fontFamily: 'SourceHanSansCN',
      fontSize: 48,
      strokeWidth: 8,
      color: [255, 255, 255],
      strokeColor: [0, 0, 0],
    })
  }

  return (
    <div className="text-con">
      <Button type="primary" icon={<DatabaseOutlined />} block loading={autoSeeding} onClick={handleSeed}>
        {autoSeeding ? '自动入库中...' : '入库花字'}
      </Button>

      <div className="text-list">
        {items.map((item) => (
          <div key={item.elementId} className="text-list-item" onClick={(e) => handleAdd(item, e)}>
            <div className="text-list-item-img">
              <img src={item.coverImgPath} alt={item.elementName} />
            </div>
            <div className="text-list-item-name">{item.elementName}</div>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              className="text-list-item-add"
              onClick={(e) => handleAdd(item, e)}
            />
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="text-empty">暂无花字，请先点击“入库花字”</div>
        )}
      </div>

      <div ref={sentinelRef} className="list-sentinel">
        {loading && <Spin size="small" />}
        {!hasMore && items.length > 0 && <span className="list-end-text">已加载全部</span>}
      </div>
    </div>
  )
}

export default TextList
