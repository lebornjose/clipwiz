import { useState } from 'react'
import { Button, Spin, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useInfiniteList } from '../../../hooks/useInfiniteList'
import { useEditorStore } from '../../../store/editorStore'
import './index.less'

interface TransitionItem {
  _id: string
  elementId: string
  elementCode: string
  elementName: string
  coverImgPath: string
  originalUrl: string
  duration: string
  coincideDuration: string
  renderResource: Record<string, string>
}

const API = '/api/transition'

const TransitionCard = ({ item }: { item: TransitionItem }) => {
  const [hovered, setHovered] = useState(false)
  const selectedTransitionKey = useEditorStore((s) => s.selectedTransitionKey)
  const updateSelectedTransition = useEditorStore((s) => s.updateSelectedTransition)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedTransitionKey) {
      message.info('请先在时间轴中选择转场位置')
      return
    }
    updateSelectedTransition({
      name: item.elementCode,
      effectId: item.elementCode,
      alias: item.elementName,
      desc: item.elementName,
      duration: parseInt(item.duration),
      format: 0,
      layerList: [],
    })
  }

  return (
    <div
      className="transition-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="transition-item__img">
        <img
          src={hovered ? item.originalUrl : item.coverImgPath}
          alt={item.elementName}
        />
      </div>
      <Button
        type="primary"
        size="small"
        icon={<PlusOutlined />}
        className="transition-item__add"
        onClick={handleAdd}
      />
      <div className="transition-item__name">{item.elementName}</div>
    </div>
  )
}

const TransitionList = () => {
  const { items: transitions, loading, hasMore, sentinelRef } =
    useInfiniteList<TransitionItem>(API, { limit: 20 })

  return (
    <div className="transition-con">
      <div className="transition-list">
        {transitions.map((item) => (
          <TransitionCard key={item._id} item={item} />
        ))}

        {transitions.length === 0 && !loading && (
          <div className="transition-empty">暂无转场数据</div>
        )}
      </div>

      <div ref={sentinelRef} className="list-sentinel">
        {loading && <Spin size="small" />}
        {!hasMore && transitions.length > 0 && (
          <span className="list-end-text">已加载全部</span>
        )}
      </div>
    </div>
  )
}

export default TransitionList
