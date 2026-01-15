# VideoPlayer 组件

一个现代化、美观的 React 视频播放器组件，基于 Canvas 渲染。

## 🎨 特性

- ✨ **现代化 UI** - 渐变背景、毛玻璃效果、流畅动画
- 🎮 **完整控制** - 播放/暂停、进度条、音量调节、全屏
- 🎯 **悬停显示** - 控制栏仅在鼠标悬停时显示，不遮挡视频
- 📱 **响应式设计** - 自适应不同屏幕尺寸
- 🔧 **模块化** - 控制器独立封装，易于复用和扩展

## 📦 组件结构

```
videoPlayer/
├── index.tsx           # 主播放器组件
├── index.less          # 播放器容器样式
├── VideoControls.tsx   # 控制器组件
├── VideoControls.less  # 控制器样式
└── mock.ts             # Mock 数据
```

## 🚀 使用方法

### 基础使用

```tsx
import VideoPlayer from '@/components/videoPlayer'

function App() {
  return <VideoPlayer />
}
```

### VideoControls 组件

控制器已封装为独立组件，可单独使用：

```tsx
import VideoControls from '@/components/videoPlayer/VideoControls'

function CustomPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <VideoControls
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      isMuted={isMuted}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onProgressChange={(value) => setCurrentTime(value)}
      onVolumeChange={(value) => setVolume(value)}
      onToggleMute={() => setIsMuted(!isMuted)}
      onFullscreen={() => console.log('Fullscreen')}
    />
  )
}
```

## 📋 Props

### VideoControls Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `isPlaying` | `boolean` | ✅ | 播放状态 |
| `currentTime` | `number` | ✅ | 当前播放时间（秒） |
| `duration` | `number` | ✅ | 总时长（秒） |
| `volume` | `number` | ✅ | 音量（0-1） |
| `isMuted` | `boolean` | ✅ | 是否静音 |
| `onPlayPause` | `() => void` | ✅ | 播放/暂停回调 |
| `onProgressChange` | `(value: number) => void` | ✅ | 进度改变回调 |
| `onVolumeChange` | `(value: number) => void` | ✅ | 音量改变回调 |
| `onToggleMute` | `() => void` | ✅ | 静音切换回调 |
| `onFullscreen` | `() => void` | ⭕ | 全屏回调（可选） |

## 🎨 样式定制

### 主题色修改

在 `VideoControls.less` 中修改主题色：

```less
// 主题色
$primary-color: #1890ff;
$primary-hover: #40a9ff;

.ant-slider-track {
  background: linear-gradient(90deg, $primary-color 0%, $primary-hover 100%);
}
```

### 控制栏背景

```less
.video-controls {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
}
```

## 🎯 交互特性

### 1. 悬停显示控制栏
- 默认隐藏控制栏，不遮挡视频内容
- 鼠标悬停时平滑显示

### 2. 音量控制
- 点击音量图标快速静音/取消静音
- 悬停音量按钮时展开音量滑块
- 音量调节范围 0-100%

### 3. 进度条
- 拖动进度条跳转播放位置
- 悬停显示时间点 tooltip
- 平滑的视觉反馈效果

### 4. 全屏支持
- 点击全屏按钮进入/退出全屏模式
- 自动适配全屏尺寸

## 🔧 扩展功能

### 添加播放速率控制

```tsx
// 在 VideoControls.tsx 中添加
const [playbackRate, setPlaybackRate] = useState(1.0)

<Select 
  value={playbackRate}
  onChange={onPlaybackRateChange}
  options={[
    { label: '0.5x', value: 0.5 },
    { label: '1.0x', value: 1.0 },
    { label: '1.5x', value: 1.5 },
    { label: '2.0x', value: 2.0 },
  ]}
/>
```

### 添加字幕开关

```tsx
<Button
  type="text"
  icon={<SubtitleIcon />}
  onClick={onToggleSubtitle}
/>
```

## 📝 注意事项

1. **性能优化**：Canvas 渲染需要合理控制帧率
2. **内存管理**：组件卸载时记得清理 Editor 实例
3. **全屏兼容性**：不同浏览器的全屏 API 可能有差异
4. **触摸设备**：移动端需要适配触摸事件

## 🐛 常见问题

**Q: 为什么控制栏不显示？**
A: 检查 CSS 的 hover 样式是否正确，或者临时移除 `opacity: 0` 调试。

**Q: 全屏后视频变形了？**
A: 在 fullscreen 状态下使用 `object-fit: contain` 保持比例。

**Q: 如何自定义控制栏位置？**
A: 修改 `.video-controls` 的 `position` 和 `bottom` 属性。

## 📄 许可

MIT License

