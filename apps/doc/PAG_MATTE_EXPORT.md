# PAG 字幕/花字双视频 Matte 导出方案

本文档描述 ClipWiz 在导出 PAG 字幕、花字时采用的 **双视频 matte** 方案。该方案用于替代绿幕/洋红幕 `colorkey` 抠色，解决字幕边缘出现绿边、粉边的问题，同时避免 PNG 序列带来的大量文件传输和 IO 压力。

---

## 1. 背景问题

当前 Web 端可以通过 `libpag` 正确预览字幕和花字，但导出链路需要把 PAG 内容交给服务端 ffmpeg 合成。曾尝试过以下方案：

| 方案 | 问题 |
|------|------|
| `MediaRecorder` 录制透明 WebM | 浏览器不稳定保留 alpha，部分输出会变成不透明黑底，覆盖原视频 |
| 绿幕/洋红幕 `colorkey` | 字幕抗锯齿边缘会和 key 色混合，导出后残留绿边/粉边 |
| PNG 序列 | 质量最好，但长视频帧数巨大，上传、解压、磁盘 IO 和 ffmpeg 输入成本高 |

字幕和花字属于高对比、强描边、半透明抗锯齿内容，使用色键抠图天然容易污染边缘。因此导出方案应保留真实 alpha，而不是从背景色反推透明度。

---

## 2. 方案目标

1. 导出效果尽量和 Web 端预览一致。
2. 不使用 mock 协议，导出只消费用户当前工程协议。
3. 不使用绿幕/洋红幕作为最终透明方案。
4. 避免 PNG 序列的大量文件传输。
5. 服务端仍由 ffmpeg 负责最终视频合成。

---

## 3. 核心思路

双视频 matte 方案将 PAG 预渲染拆成两路压缩视频：

| 文件 | 内容 | 用途 |
|------|------|------|
| `color.webm` | PAG 正常颜色画面，透明区域填黑 | 保存字幕/花字 RGB 信息 |
| `alpha.webm` | 只保存透明度，透明区域黑，不透明区域白，半透明区域灰 | 保存 alpha matte |

服务端使用 ffmpeg 将两路视频合成为带 alpha 的 overlay 流：

```text
color.webm + alpha.webm -> alphamerge -> rgba overlay -> 主视频
```

这样传输的是两个压缩视频，而不是成百上千张 PNG；透明边缘来自 matte，不依赖 `colorkey`，因此不会出现绿边/粉边。

---

## 4. 前端预渲染

### 4.1 输入

前端仍使用当前协议中的 `text` / `subtitle` 轨道项：

```ts
interface PagEditableItem {
  id: string
  format: 'text' | 'subtitle'
  url: string
  text: string
  startTime: number
  endTime: number
  position?: [number, number]
  fontFamily?: string
  fontSize?: number
  color?: [number, number, number]
  strokeColor?: [number, number, number]
  strokeWidth?: number
}
```

时间单位必须保持协议标准：**毫秒（ms）**。

### 4.2 渲染 color 视频

`color.webm` 按 Web 预览规则渲染 PAG：

1. 使用 `libpag` 加载 PAG 模板。
2. 按协议替换文本和样式。
3. 每帧设置 `pagView.setProgress(progress)` 并 `flush()`。
4. 将 PAG canvas 绘制到录制 canvas。
5. 透明背景填黑。
6. 使用 `MediaRecorder` 输出 WebM。

color 视频只负责 RGB，不要求保留 alpha。

### 4.3 渲染 alpha 视频

`alpha.webm` 需要表达每个像素的透明度：

1. 仍使用同一帧 PAG 渲染结果。
2. 读取当前帧像素 alpha。
3. 输出黑白 matte：
   - alpha = 0 -> 黑色 `rgb(0,0,0)`
   - alpha = 255 -> 白色 `rgb(255,255,255)`
   - 半透明 -> 对应灰度值
4. 使用 `MediaRecorder` 输出 WebM。

alpha 视频只负责透明度，不关心颜色。

### 4.4 上传结构

推荐上传一个成对资源结构：

```json
{
  "id": "pag-prerender-33434",
  "format": "pagMatte",
  "colorUrl": "/uploads/xxx-color.webm",
  "alphaUrl": "/uploads/xxx-alpha.webm",
  "startTime": 0,
  "endTime": 10000,
  "width": 1280,
  "height": 720,
  "transform": {
    "translate": [0, 0, 0],
    "scale": [1, 1, 1],
    "rotate": [0, 0, 0]
  }
}
```

注意：PAG 预渲染画布是完整视频画布，位置已经体现在 PAG 内容中，导出阶段不要再用 `position` 移动整张画布。

---

## 5. 后端合成

服务端接收到 `pagMatte` 资源后，将 `colorUrl` 和 `alphaUrl` 作为两个输入。

核心 ffmpeg filter 形态：

```text
[color:v]format=rgb24[color_rgb];
[alpha:v]format=gray[alpha_gray];
[color_rgb][alpha_gray]alphamerge,format=rgba[pag_rgba];
[base][pag_rgba]overlay=x=0:y=0:eof_action=pass:shortest=0[out]
```

如果需要按时间轴显示，应先对两路视频做相同的裁剪和时间偏移：

```text
[color:v]trim=start=0:end=duration,setpts=PTS-STARTPTS+start/TB[color_t];
[alpha:v]trim=start=0:end=duration,setpts=PTS-STARTPTS+start/TB[alpha_t];
[color_t]format=rgb24[color_rgb];
[alpha_t]format=gray[alpha_gray];
[color_rgb][alpha_gray]alphamerge,format=rgba[pag_rgba]
```

多段 PAG 资源按时间顺序叠加到当前视频链路上。

---

## 6. 协议扩展建议

可以新增一种内部导出素材格式，不影响编辑协议原始 `text` / `subtitle` 轨：

```ts
interface IPagMatteTrackItem extends TrackItem {
  format: 'pagMatte'
  desc: 'pag-matte-text' | 'pag-matte-subtitle'
  colorUrl: string
  alphaUrl: string
  width: number
  height: number
  duration: number
  transform: Transform
  materialId?: string
}
```

该类型仅用于导出前的临时协议，不建议保存回用户工程，避免下次导出重复叠加历史预渲染结果。

---

## 7. 和其他方案的对比

| 方案 | 质量 | 传输成本 | 实现成本 | 风险 |
|------|------|----------|----------|------|
| 绿幕/洋红幕 `colorkey` | 低 | 低 | 低 | 边缘污染明显 |
| PNG 序列 | 高 | 高 | 中 | 长视频 IO 压力大 |
| WebM alpha | 中/高 | 低 | 中 | 浏览器和 ffmpeg alpha 支持不稳定 |
| 服务端 native libpag | 高 | 低 | 高 | 需要 native SDK 集成 |
| 双视频 matte | 高 | 中 | 中 | 需要维护 color/alpha 成对资源 |

当前推荐：**双视频 matte**。

长期可选升级：服务端 native libpag 渲染，彻底取消前端预渲染上传。

---

## 8. 实现注意事项

1. color 和 alpha 两路视频必须使用相同的 `fps`、分辨率、时长和帧数。
2. 两路视频必须使用同一套 PAG progress 计算。
3. alpha 视频不要使用有损色彩转换导致灰度大幅偏移，后端读取时统一 `format=gray`。
4. 生成的 matte 资源不应保存回工程协议，只作为一次导出的临时产物。
5. 导出接口必须拒绝空协议或非法协议，不能回退到 mock。
6. 如果某些浏览器录制的 alpha matte 压缩后有噪点，可在后端对 matte 做轻微 `curves` 或 `lut` 阈值修正，但默认不建议过度锐化，避免吃掉文字抗锯齿边缘。

---

## 9. 验收标准

1. 导出视频中主视频画面完整，不被字幕层黑底覆盖。
2. 字幕/花字位置与 Web 预览一致。
3. 字幕/花字边缘没有绿色、粉色或其他 key 色残留。
4. 字幕/花字描边、颜色、字号与 Web 预览一致。
5. 同一工程连续导出不会叠加旧的预渲染轨道。
6. 不传 `trackInfo` 时导出接口返回错误，不使用 mock。
