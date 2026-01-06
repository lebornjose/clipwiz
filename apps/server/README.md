# ClipWiz Server - 视频合成服务

基于 Node.js + Express + FFmpeg 的视频处理后端服务。

## 功能特性

- 📹 视频上传管理
- ✂️ 视频裁剪与合并
- 🎬 视频转码
- 💧 添加水印
- 🔄 任务队列处理
- 📊 进度追踪

## 技术栈

- Node.js
- Express
- TypeScript
- FFmpeg (视频处理)
- Bull (任务队列)
- Redis (队列存储)
- Multer (文件上传)

## 前置要求

- Node.js >= 18.0.0
- Redis Server
- FFmpeg

### 安装 FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
从 [FFmpeg 官网](https://ffmpeg.org/download.html) 下载并安装

### 安装 Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

## 开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 生产环境运行
pnpm start
```

## 环境变量

```env
PORT=4000
NODE_ENV=development

REDIS_HOST=localhost
REDIS_PORT=6379

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=500000000

FFMPEG_PATH=/usr/local/bin/ffmpeg
FFPROBE_PATH=/usr/local/bin/ffprobe
```

## API 端点

### 上传

- `POST /api/upload` - 上传单个视频
- `POST /api/upload/multiple` - 上传多个视频

### 视频处理

- `GET /api/video/info/:fileId` - 获取视频信息
- `POST /api/video/trim` - 裁剪视频
- `POST /api/video/merge` - 合并视频
- `POST /api/video/watermark` - 添加水印
- `POST /api/video/transcode` - 视频转码

### 任务管理

- `GET /api/job/:jobId` - 获取任务状态
- `GET /api/job` - 获取所有任务
- `DELETE /api/job/:jobId` - 取消任务

## 项目结构

```
src/
├── routes/         # 路由定义
├── services/       # 业务逻辑
├── middleware/     # 中间件
└── index.ts        # 入口文件
```

