import './index.less'
// 素材列表

const PhotoList = () => {
  const variant = 'outline';
  return (
    <div className="photo-con">
      {/* <div className="list">
        <Tag>全部</Tag>
        <Tag>视频</Tag>
        <Tag>图片</Tag>
      </div> */}
      <div className='photo-list'>
        <div className='photo-list-item'>
            <div className='photo-list-item-img'>
                <img src="https://chrome1.oss-cn-shanghai.aliyuncs.com/0001.png" alt="素材" />
            </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoList
