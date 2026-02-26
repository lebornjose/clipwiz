import { IVideoTrackItem } from '@clipwiz/shared';

// ✅ 定义 Props 接口
interface VideoTrackImgProps {
  videoTrackItem: IVideoTrackItem | null;
}

// ✅ 使用对象解构接收 props
export const VideoTrackImg = ({ videoTrackItem }: VideoTrackImgProps) => {
  // ✅ 直接使用 videoUrl，不需要 useState（因为它来自 props）
  const videoUrl = videoTrackItem?.url || '';

  const count = 10;

  return (
    <div className='effect-item-video'>
      {
        Array.from({ length: count }).map((_, index) => {
          return (
            <img
              src={`${videoUrl}?x-oss-process=video/snapshot,t_${index * 100},w_160,h_100`}
              key={index}
              alt={`video-frame-${index}`}
            />
          )
        })
      }
    </div>
  )
}
