// 需要实现一个音频的列表展示加播放

import { useState } from 'react'
import { Button } from 'antd'
import { PlayCircleOutlined, PlusOutlined } from '@ant-design/icons'
import './index.less'
import { audioList as audioListData } from './mock'
import { useEffect } from 'react'

const AudioList = () => {
  const [audioList, setAudioList] = useState<typeof audioListData>([])

  useEffect(() => {
    setAudioList(audioListData)
  }, [])

  const handlePlay = (url: string) => {
    // 播放音频
    const audio = new Audio(url)
    audio.play()
  }

  const handleAdd = (item: typeof audioListData[0]) => {
    // 添加到时间轴
    console.log('添加音频到时间轴:', item)
  }

  return (
    <div className="audio-list">
      {audioList.map((item) => (
        <div key={item.id} className="audio-item">
          <div className="audio-info">
            <Button
              type="text"
              icon={<PlayCircleOutlined style={{ fontSize: 32, color: '#5B8FF9' }} />}
              onClick={() => handlePlay(item.url)}
              className="play-btn"
            />
            <div className="audio-details">
              <div className="audio-name">{item.name}</div>
              <div className="audio-duration">{item.duration || '00:00'}</div>
            </div>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(item)}
            className="add-btn"
          >
          </Button>
        </div>
      ))}
    </div>
  )
}

export default AudioList
