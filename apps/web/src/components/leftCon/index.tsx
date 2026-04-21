import { Tabs } from 'antd'
import {
  VideoCameraOutlined, AudioOutlined, FileImageOutlined,
  FontSizeOutlined, SwapOutlined, FilterOutlined
 } from '@ant-design/icons'
import MaterialList from './material'
import AudioList from './audio'
import PhotoList from './photo'
import FilterList from './filter'
import TransitionList from './transition'
import TextList from './text'
import './index.less'

const LeftCon = () => {
  const items = [
      {key: '1', icon: <VideoCameraOutlined />, label: '素材', children: <MaterialList />},
      {key: '2', icon: <AudioOutlined />, label: '音频', children: <AudioList />},
      {key: '3', icon: <FontSizeOutlined />, label: '花字', children: <TextList />},
      {key: '4', icon: <FileImageOutlined />, label: '贴纸', children: <PhotoList />},
      {key: '7', icon: <FilterOutlined />, label: '滤镜', children: <FilterList />},
      {key: '6', icon: <SwapOutlined />, label: '转场', children: <TransitionList />},
  ]
  return (
    <div className='left-con'>
      <Tabs
        defaultActiveKey="1"
        items={items}
        indicator={{ size: 0 }}
        size="small"
        tabBarGutter={16}
      />
    </div>
  )
}

export default LeftCon
