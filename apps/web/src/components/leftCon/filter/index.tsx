import { Button, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { MATERIAL_TYPE } from '@clipwiz/shared'
import { useInfiniteList } from '../../../hooks/useInfiniteList'
import { useEditorStore } from '../../../store/editorStore'
import './index.less'

interface FilterItem {
  _id: string
  elementId: string
  elementCode: string
  name: string
  coverImgPath: string
  cubeUrl: string
  tags: string[]
}

const API = '/api/filter'

const FilterList = () => {
  const { items: filters, loading, hasMore, sentinelRef } =
    useInfiniteList<FilterItem>(API, { limit: 20 })
  const addTrackItem = useEditorStore((s) => s.addTrackItem)

  const handleAdd = (item: FilterItem, e: React.MouseEvent) => {
    e.stopPropagation()
    addTrackItem(MATERIAL_TYPE.FILTER, {
      format: MATERIAL_TYPE.FILTER,
      name: item.name,
      code: item.elementCode,
    })
  }

  return (
    <div className="filter-con">
      <div className="filter-list">
        {filters.map((item) => (
          <div key={item._id} className="filter-item">
            <div className="filter-item__img">
              <img src={item.coverImgPath} alt={item.name} />
            </div>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              className="filter-item__add"
              onClick={(e) => handleAdd(item, e)}
            />
            <div className="filter-item__name">{item.name}</div>
          </div>
        ))}

        {filters.length === 0 && !loading && (
          <div className="filter-empty">暂无滤镜数据</div>
        )}
      </div>

      <div ref={sentinelRef} className="list-sentinel">
        {loading && <Spin size="small" />}
        {!hasMore && filters.length > 0 && <span className="list-end-text">已加载全部</span>}
      </div>
    </div>
  )
}

export default FilterList
