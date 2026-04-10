# ClipWiz 视频协议文档

本文档描述 ClipWiz 编辑器的核心视频数据协议，定义了时间轴轨道结构、素材节点及其属性规范。所有类型定义源于 `packages/shared/src/video.ts` 和 `packages/shared/src/enum.ts`。

---

## 1. 顶层数据结构 `ITrackInfo`

`ITrackInfo` 是整个视频工程的根数据结构，描述一条完整的视频序列。

```ts
interface ITrackInfo {
  width: number    // 导出视频宽度（像素）
  height: number   // 导出视频高度（像素），切换画面比例时只改 width，height 保持不变
  duration: number // 视频总时长（秒）
  fps?: number     // 帧率（默认 25fps）
  tracks: ITrack[] // 轨道列表（有序，渲染时按轨道层级叠加）
}
```

---

## 2. 素材类型枚举 `MATERIAL_TYPE`

```ts
enum MATERIAL_TYPE {
  VIDEO    = 'video',      // 视频
  AUDIO    = 'audio',      // 音频
  IMAGE    = 'image',      // 图片（静态）
  GIF      = 'gif',        // GIF 动图
  PHOTO    = 'photo',      // 贴图（叠加层）
  TEXT     = 'text',       // 花字
  SUBTITLE = 'subtitle',   // 字幕
  BGM      = 'bgm',        // 背景音乐标识
  BGM_AUDIO= 'bgmAudio',   // 背景音乐轨道类型
  ORAL     = 'oral',       // 口播标识
  ORAL_AUDIO='oralAudio',  // 口播音频轨道类型
  SOUND_AUDIO='soundAudio',// 音效
  BACKGROUND='background', // 背景音乐
  FILTER   = 'filter',     // 滤镜
}
```

---

## 3. 时间模型

所有时间单位均为 **秒（浮点数）**。

| 字段 | 含义 |
|------|------|
| `startTime` | 轨道项在 **整个视频时间轴** 上的起始时间 |
| `endTime`   | 轨道项在 **整个视频时间轴** 上的结束时间 |
| `fromTime`  | 素材内部的起始裁剪点（相对于原始素材） |
| `toTime`    | 素材内部的结束裁剪点（相对于原始素材） |
| `duration`  | 素材/片段的总时长 |

> **关键关系**：`endTime - startTime = toTime - fromTime`（播放时长 = 素材裁剪时长）

---

## 4. 公共基础接口 `TrackItem`

所有轨道item均继承此接口：

```ts
interface TrackItem {
  id: string          // 全局唯一ID
  materialId?: string // 对应的素材库ID
  url?: string        // 素材资源地址（字幕等类型可为空）
  startTime: number   // 在时间轴上的起始时间（秒）
  endTime: number     // 在时间轴上的结束时间（秒）
  hide: boolean       // 是否隐藏该片段
}
```

---

## 5. 轨道类型与结构

### 5.1 视频轨道 `VideoTrack`

```ts
interface VideoTrack {
  trackType: MATERIAL_TYPE.VIDEO   // 固定值 'video'
  trackId: string
  hide: boolean
  children: IVideoTrackItem[]
}
```

#### 视频片段 `IVideoTrackItem`

```ts
interface IVideoTrackItem extends TrackItem {
  format: MATERIAL_TYPE.VIDEO | MATERIAL_TYPE.IMAGE
  title?: string        // 素材名称
  duration: number      // 素材原始时长（秒）
  fromTime: number      // 素材裁剪起点
  toTime: number        // 素材裁剪终点
  width: number         // 视频分辨率宽
  height: number        // 视频分辨率高
  alpha?: number        // 透明度 0~1
  muted?: boolean       // 是否静音
  volume: number        // 音量 0~1
  playRate: number      // 播放速率（1 为正常）
  transform?: Transform // 位移/旋转/缩放
  crop?: Crop           // 裁剪区域（归一化坐标 0~1）
  needCut: number       // 是否需要裁切（0=否，1=是）
  soundtrack?: number   // 是否保留原声（0=否，1=是）
  audioStartTime?: number
  audioEndTime?: number
  fadeIn?: number       // 视频淡入时间（秒）
  fadeOut?: number      // 视频淡出时间（秒）
  scaleMode?: number    // 缩放模式
  segmentId?: string    // 片段ID（分段处理时使用）
  segmentStartTime?: number // 片段可播放最小时间
  segmentEndTime?: number   // 片段可播放最大时间
  transitionIn?: TransitionItem  // 入场转场
  transitionOut?: TransitionItem // 出场转场
}
```

---

### 5.2 背景音乐轨道 `BgmAudioTrack`

```ts
interface BgmAudioTrack {
  trackType: MATERIAL_TYPE.BGM_AUDIO  // 固定值 'bgmAudio'
  trackId: string
  hide: boolean
  children: IAudioTrackItem[]
}
```

#### 音频片段 `IAudioTrackItem`

```ts
interface IAudioTrackItem extends TrackItem {
  duration: number       // 音频原始时长（秒）
  fromTime: number       // 音频裁剪起点
  toTime: number         // 音频裁剪终点
  title: string          // 音频名称 / 口播文案
  playRate: number       // 播放速率 0~1
  volume: number         // 音量 0~1
  sound: number          // 声音增益
  audioSpeaker?: string  // 口播音色ID
  fadeIn?: number        // 淡入时间（秒）
  fadeOut?: number       // 淡出时间（秒）
  muted: boolean         // 是否静音
  format?: string        // 文件格式
}
```

---

### 5.3 贴图轨道 `PhotoTrack`

```ts
interface PhotoTrack {
  trackType: MATERIAL_TYPE.PHOTO  // 固定值 'photo'
  trackId: string
  hide: boolean
  children: IPhotoTrackItem[]
}
```

#### 贴图片段 `IPhotoTrackItem`

```ts
interface IPhotoTrackItem extends TrackItem {
  format: MATERIAL_TYPE.IMAGE | MATERIAL_TYPE.GIF
  desc: string           // 贴图描述
  width: number          // 贴图宽度（像素）
  height: number         // 贴图高度（像素）
  duration: number       // 贴图持续时长
  transform?: Transform  // 位移/旋转/缩放
  crop: Crop             // 裁剪区域
}
```

---

### 5.4 字幕轨道 `SubtitleTrack`

```ts
interface SubtitleTrack {
  trackType: MATERIAL_TYPE.SUBTITLE  // 固定值 'subtitle'
  trackId: string
  hide: boolean
  children: ISubtitleTrackItem[]
}
```

#### 字幕片段 `ISubtitleTrackItem`

```ts
interface ISubtitleTrackItem extends TrackItem {
  format: MATERIAL_TYPE.SUBTITLE
  text: string                     // 字幕文本内容
  duration: number                 // 持续时长（秒）
  position: [number, number]       // 字幕位置 [x, y]（归一化 0~1）
  fontFamily: string               // 字体名称
  fontSize: number                 // 字号（px）
  color: [number, number, number]  // 文字颜色 [R, G, B]（0~255）
  strokeWidth: number              // 描边宽度（px）
  strokeColor: [number, number, number] // 描边颜色 [R, G, B]
}
```

---

### 5.5 文本轨道 `TextTrack`

```ts
interface TextTrack {
  trackType: MATERIAL_TYPE.TEXT  // 固定值 'text'
  trackId: string
  hide: boolean
  children: ITextTrackItem[]
}
```

#### 文本片段 `ITextTrackItem`

```ts
interface ITextTrackItem extends TrackItem {
  format: MATERIAL_TYPE.TEXT
  text: string      // 文本内容
  duration: number  // 持续时长
}
```

---

### 5.6 滤镜轨道 `FilterTrack`

```ts
interface FilterTrack {
  trackType: MATERIAL_TYPE.FILTER  // 固定值 'filter'
  trackId: string
  hide: boolean
  children: IFilterTrackItem[]
}
```

#### 滤镜片段 `IFilterTrackItem`

```ts
interface IFilterTrackItem extends TrackItem {
  format: MATERIAL_TYPE.FILTER
  name: string  // 滤镜名称
  code: string  // 滤镜 GLSL/自定义代码
}
```

---

## 6. 公共子类型

### 6.1 空间变换 `Transform`

```ts
interface Transform {
  translate: [number, number, number]  // [x, y, z] 位移，0.5 = 居中
  rotate:    [number, number, number]  // [x, y, z] 旋转角度（度）
  scale:     [number, number, number]  // [x, y, z] 缩放比例，1 = 原始
}
```

### 6.2 裁剪区域 `Crop`

```ts
interface Crop {
  x0: number  // 左边界（归一化 0~1）
  x1: number  // 右边界（归一化 0~1）
  y0: number  // 上边界（归一化 0~1）
  y1: number  // 下边界（归一化 0~1）
}
```

### 6.3 转场 `TransitionItem`

```ts
interface TransitionItem {
  alias: string       // 转场别名（显示用）
  name: string        // 转场名称
  desc: string        // 描述
  effectId: string    // 转场效果ID
  duration: number    // 转场时长（秒）
  format: number      // 转场格式标识
  layerList: string[] // 参与转场的图层ID列表
}
```

---

## 7. 播放器节点接口（运行时）

这些接口在播放器运行时内部使用，是 `ITrackItem` 在内存中的实例化形态。

| 接口 | 对应素材类型 | 说明 |
|------|------------|------|
| `INode` | 基础节点 | 所有节点的公共基类 |
| `IVideoNode` | VIDEO/IMAGE | 视频/图片节点，含转场、变速、静音 |
| `IPhotoNode` | IMAGE/GIF | 贴图节点，含裁剪、变换 |
| `IAudioNode` | BGM_AUDIO | 音频节点，含淡入淡出、音量 |

播放器通过 `INode.connect(DestinationNode)` 将节点接入渲染图，通过 `start(startTime)` / `stop(endTime)` 控制播放区间。

---

## 8. 完整示例

```json
{
  "width": 1920,
  "height": 1080,
  "duration": 10.0,
  "fps": 25,
  "tracks": [
    {
      "trackType": "video",
      "trackId": "track-video-1",
      "hide": false,
      "children": [
        {
          "id": "item-001",
          "materialId": "mat-abc",
          "url": "https://cdn.example.com/video.mp4",
          "startTime": 0,
          "endTime": 5.0,
          "hide": false,
          "format": "video",
          "title": "主视频",
          "duration": 30.0,
          "fromTime": 2.0,
          "toTime": 7.0,
          "width": 1920,
          "height": 1080,
          "volume": 1,
          "playRate": 1,
          "needCut": 0,
          "soundtrack": 1
        }
      ]
    },
    {
      "trackType": "bgmAudio",
      "trackId": "track-bgm-1",
      "hide": false,
      "children": [
        {
          "id": "item-002",
          "materialId": "mat-bgm",
          "url": "https://cdn.example.com/bgm.mp3",
          "startTime": 0,
          "endTime": 10.0,
          "hide": false,
          "duration": 120.0,
          "fromTime": 0,
          "toTime": 10.0,
          "title": "背景音乐",
          "playRate": 1,
          "volume": 0.8,
          "sound": 1,
          "fadeIn": 1.0,
          "fadeOut": 1.0,
          "muted": false
        }
      ]
    },
    {
      "trackType": "subtitle",
      "trackId": "track-subtitle-1",
      "hide": false,
      "children": [
        {
          "id": "item-003",
          "startTime": 1.0,
          "endTime": 3.5,
          "hide": false,
          "format": "subtitle",
          "text": "Hello World",
          "duration": 2.5,
          "position": [0.5, 0.85],
          "fontFamily": "PingFangSC",
          "fontSize": 36,
          "color": [255, 255, 255],
          "strokeWidth": 2,
          "strokeColor": [0, 0, 0]
        }
      ]
    }
  ]
}
```

---

## 9. 渲染层级规则

轨道在 `tracks` 数组中的顺序决定渲染叠加层级：

1. **视频轨道（VIDEO）** — 底层，主画面
2. **贴图轨道（PHOTO）** — 叠加在视频之上
3. **字幕/文本轨道（SUBTITLE/TEXT）** — 最顶层文字
4. **滤镜轨道（FILTER）** — 作用于整个画面
5. **音频轨道（BGM_AUDIO）** — 仅音频，无画面层级概念

---

## 10. 时间常量 `TIME_CONFIG`

```ts
enum TIME_CONFIG {
  SUBTITLE_TRANSITION = 1,      // 字幕动画时间（秒）
  FRAME_TIME = 0.04,            // 单帧时长（秒）= 1/25fps
  FRAME_TIME_MILL = 40,         // 单帧时长（毫秒）
  MILL_TIME_CONVERSION = 1000,  // 毫秒 → 秒 除以 1000
}
```
