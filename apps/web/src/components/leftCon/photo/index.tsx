import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { MATERIAL_TYPE } from '@clipwiz/shared'
import { useEditorStore } from '../../../store/editorStore'
import './index.less'

interface StickerItem {
  elementId: string
  elementName: string
  coverImgPath: string
  originalUrl: string
  width: number
  height: number
}

const stickers: StickerItem[] = [
  { elementId: '250130828465170', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252032.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2032.gif', width: 200, height: 200 },
  { elementId: '250130828465184', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252033.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2033.gif', width: 200, height: 200 },
  { elementId: '250130828465192', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252034.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2034.gif', width: 200, height: 200 },
  { elementId: '250130828465204', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252035.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2035.gif', width: 200, height: 200 },
  { elementId: '250130828465216', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252036.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2036.gif', width: 200, height: 200 },
  { elementId: '250130828465223', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252037.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2037.gif', width: 200, height: 200 },
  { elementId: '250130828465231', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/%25E7%25AE%25AD%25E5%25A4%25B4%25E6%259B%25B4%25E6%2594%25B9%252038.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/%E7%AE%AD%E5%A4%B4%E6%9B%B4%E6%94%B9%2038.gif', width: 200, height: 200 },
  { elementId: '250130828465245', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/1.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/1.gif', width: 200, height: 200 },
  { elementId: '250130828465251', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/2.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/2.gif', width: 200, height: 200 },
  { elementId: '250130828465267', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/3.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/3.gif', width: 200, height: 200 },
  { elementId: '250130828465278', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/4.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/4.gif', width: 200, height: 200 },
  { elementId: '250130828465289', elementName: '提示箭头', coverImgPath: 'https://mogic-spider.oss-cn-hangzhou.aliyuncs.com/jy/cover-0825/5.png', originalUrl: 'https://mogic-spider.getmogic.com/jy/5.gif', width: 200, height: 200 },
]

const StickerCard = ({ item }: { item: StickerItem }) => {
  const [hovered, setHovered] = useState(false)
  const addTrackItem = useEditorStore((s) => s.addTrackItem)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addTrackItem(MATERIAL_TYPE.PHOTO, {
      url: item.originalUrl,
      format: MATERIAL_TYPE.GIF,
      desc: item.elementName,
      width: item.width,
      height: item.height,
      duration: 5000,
      endTime: 5000,
      crop: { x0: 0, x1: 1, y0: 0, y1: 1 },
      transform: { scale: [1, 1, 1], rotate: [0, 0, 0], translate: [0, 0, 0] },
    })
  }

  return (
    <div
      className="photo-list-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="photo-list-item-img">
        <img
          src={hovered ? item.originalUrl : item.coverImgPath}
          alt={item.elementName}
        />
      </div>
      <Button type="primary" size="small" icon={<PlusOutlined />} className="photo-list-item-add" onClick={handleAdd} />
    </div>
  )
}

const PhotoList = () => {
  return (
    <div className="photo-con">
      <div className="photo-list">
        {stickers.map((item) => (
          <StickerCard key={item.elementId} item={item} />
        ))}
      </div>
    </div>
  )
}

export default PhotoList
