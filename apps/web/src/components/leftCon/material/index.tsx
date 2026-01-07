import { Tag } from 'antd';
import './index.less'
import { VideoCameraOutlined, FileImageOutlined } from '@ant-design/icons'
// 素材列表

const MaterialList = () => {
  const variant = 'outline';
  return (
    <div className="material-con">
      {/* <div className="list">
        <Tag>全部</Tag>
        <Tag>视频</Tag>
        <Tag>图片</Tag>
      </div> */}
      <div className='material-list'>
        <div className='material-list-item'>
            <div className='material-list-item-img'>
                <img src="https://chrome1.oss-cn-shanghai.aliyuncs.com/0001.png" alt="素材" />
            </div>
            <div className='material-list-item-name'>
                素材1
            </div>
            <Tag icon={<VideoCameraOutlined />}>视频</Tag>
        </div>
        <div className='material-list-item'>
            <div className='material-list-item-img'>
                <img src="https://chrome1.oss-cn-shanghai.aliyuncs.com/0001.png" alt="素材" />
            </div>
            <div className='material-list-item-name'>
                素材1
            </div>
            <Tag icon={<FileImageOutlined />}>图片</Tag>
        </div>
      </div>
    </div>
  )
}

export default MaterialList
