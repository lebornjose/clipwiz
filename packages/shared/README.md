# @clipwiz/shared

ClipWiz 项目的共享代码库，包含类型定义、工具函数和常量。

## 使用方式

```typescript
import { 
  VideoOperation, 
  JobStatus, 
  formatFileSize, 
  formatDuration,
  API_ENDPOINTS 
} from '@clipwiz/shared'

// 使用类型
const operation: VideoOperation = VideoOperation.TRIM

// 使用工具函数
const size = formatFileSize(1024 * 1024) // "1 MB"
const duration = formatDuration(125) // "02:05"

// 使用常量
const uploadUrl = API_ENDPOINTS.UPLOAD
```

## 导出内容

### 类型 (types.ts)

- `VideoOperation` - 视频操作枚举
- `JobStatus` - 任务状态枚举
- `VideoInfo` - 视频信息接口
- `FileInfo` - 文件信息接口
- `JobData` - 任务数据接口
- `JobResult` - 任务结果接口
- `JobInfo` - 任务信息接口
- `TimelineItem` - 时间轴项接口
- `ProjectConfig` - 项目配置接口

### 工具函数 (utils.ts)

- `formatFileSize(bytes)` - 格式化文件大小
- `formatDuration(seconds)` - 格式化时间为 HH:MM:SS
- `parseDuration(timeString)` - 解析时间字符串为秒
- `generateId()` - 生成唯一 ID
- `delay(ms)` - 延迟函数
- `isValidVideoFormat(filename)` - 验证视频格式
- `isValidAudioFormat(filename)` - 验证音频格式
- `getFileExtension(filename)` - 获取文件扩展名
- `calculatePercentage(current, total)` - 计算百分比

### 常量 (constants.ts)

- `API_ENDPOINTS` - API 端点
- `VIDEO_RESOLUTIONS` - 视频分辨率预设
- `VIDEO_FORMATS` - 视频格式
- `VIDEO_FPS` - 帧率预设
- `SUPPORTED_VIDEO_FORMATS` - 支持的视频格式
- `SUPPORTED_AUDIO_FORMATS` - 支持的音频格式
- `WATERMARK_POSITIONS` - 水印位置

