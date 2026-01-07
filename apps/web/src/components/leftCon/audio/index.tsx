// 需要实现一个音频的列表展示加播放

import { useState } from 'react'
import { List } from 'antd'
import { AudioOutlined } from '@ant-design/icons'
import './index.less'
import { audioList as audioListData } from './mock'
import { useEffect } from 'react'
const AudioList = () => {
  const [audioList, setAudioList] = useState<typeof audioListData>([])
  useEffect(() => {
    setAudioList(audioListData)
  }, [])

  return (
    <div className="audio-list">
      <List
        dataSource={audioList}
        renderItem={(item) => (
          <List.Item key={item?.id}>
            <List.Item.Meta
              avatar={<AudioOutlined />}
              title={item?.name}
              description={item?.url}
            />
          </List.Item>
        )}
      />
    </div>
  )
}

export default AudioList
