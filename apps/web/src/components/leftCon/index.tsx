import { Tabs } from 'antd'
import {
  VideoCameraOutlined, AudioOutlined, FileTextOutlined, FileImageOutlined,
  FontSizeOutlined, SwapOutlined, FilterOutlined
 } from '@ant-design/icons'
import MaterialList from './material'
import AudioList from './audio'
import './index.less'

const LeftCon = () => {
  const items = [
      {key: '1', icon: <VideoCameraOutlined />, label: '素材', children: <MaterialList />},
      {key: '2', icon: <AudioOutlined />, label: '音频', children: <AudioList />},
      {key: '3', icon: <FileTextOutlined />, label: '文本', children: <div>图片</div>},
      {key: '4', icon: <FileImageOutlined />, label: '贴纸', children: <div>文字</div>},
      {key: '5', icon: <FontSizeOutlined />, label: '特效', children: <div>形状</div>},
      {key: '6', icon: <SwapOutlined />, label: '转场', children: <div>其他</div>},
      {key: '7', icon: <FilterOutlined />, label: '滤镜', children: <div>其他</div>},
  ]
  return (
    <div className='left-con'>
      <Tabs
        defaultActiveKey="1"
        centered
        items={items}
        indicator={{ size: 0 }}
        size="small"
        tabBarGutter={16}
      />
    </div>
  )
}

export default LeftCon
