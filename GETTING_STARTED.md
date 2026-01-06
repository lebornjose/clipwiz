# ClipWiz 快速开始指南

## 前置要求

在开始之前，请确保你的系统已安装：

- **Node.js** >= 18.0.0 ([下载](https://nodejs.org/))
- **pnpm** >= 8.0.0 (安装: `npm install -g pnpm`)
- **Redis** ([安装指南](#安装-redis))
- **FFmpeg** ([安装指南](#安装-ffmpeg))

## 安装 Redis

### macOS
```bash
brew install redis
brew services start redis
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Windows
下载并安装 [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

## 安装 FFmpeg

### macOS
```bash
brew install ffmpeg
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows
1. 从 [FFmpeg 官网](https://ffmpeg.org/download.html) 下载
2. 解压到合适位置
3. 将 FFmpeg 的 `bin` 目录添加到系统 PATH

## 项目安装

### 1. 克隆/进入项目目录
```bash
cd /Users/huangxing/projects/super/clipWiz
```

### 2. 安装依赖
```bash
pnpm install
```

或使用提供的脚本：
```bash
./scripts/setup.sh
```

### 3. 配置环境变量

创建后端配置文件：
```bash
cd apps/server
cp .env.example .env
```

根据实际情况修改 `.env` 文件中的配置。

## 启动项目

### 方式 1: 同时启动所有服务（推荐）
```bash
pnpm dev
```

这将同时启动：
- Web 编辑器: http://localhost:3000
- 后端服务: http://localhost:4000

### 方式 2: 分别启动服务

**启动 Web 编辑器：**
```bash
pnpm dev:web
```
访问: http://localhost:3000

**启动后端服务：**
```bash
pnpm dev:server
```
API 地址: http://localhost:4000

## 构建生产版本

### 构建所有项目
```bash
pnpm build
```

### 分别构建
```bash
# 构建 Web 编辑器
pnpm build:web

# 构建后端服务
pnpm build:server
```

## 项目结构

```
clipWiz/
├── apps/
│   ├── web/          # React 视频编辑器
│   └── server/       # Node.js 后端服务
└── packages/
    └── shared/       # 共享代码库
```

## 常用命令

```bash
# 开发模式
pnpm dev              # 启动所有服务
pnpm dev:web          # 只启动 Web 编辑器
pnpm dev:server       # 只启动后端服务

# 构建
pnpm build            # 构建所有项目
pnpm build:web        # 构建 Web 编辑器
pnpm build:server     # 构建后端服务

# 代码检查
pnpm lint             # 运行 ESLint
pnpm type-check       # TypeScript 类型检查

# 清理
pnpm clean            # 清理所有构建产物和依赖
./scripts/clean.sh    # 使用脚本清理
```

## 功能验证

### 1. 验证后端服务
```bash
curl http://localhost:4000/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "ClipWiz Server is running"
}
```

### 2. 验证 Redis 连接
```bash
redis-cli ping
```

应该返回：`PONG`

### 3. 验证 FFmpeg
```bash
ffmpeg -version
```

应该显示 FFmpeg 版本信息。

## 测试视频上传和处理

1. 打开浏览器访问 http://localhost:3000
2. 点击"上传视频"按钮
3. 选择一个视频文件
4. 上传成功后会在画布中显示
5. 使用工具栏进行编辑操作
6. 点击"导出视频"开始处理

## 常见问题

### Q: pnpm install 失败
A: 确保 Node.js 版本 >= 18.0.0，并且 pnpm 版本 >= 8.0.0

### Q: Redis 连接失败
A: 确保 Redis 服务已启动：
```bash
# macOS
brew services list

# Ubuntu
sudo systemctl status redis
```

### Q: FFmpeg 找不到
A: 确保 FFmpeg 已安装并在 PATH 中：
```bash
which ffmpeg  # macOS/Linux
where ffmpeg  # Windows
```

如果 FFmpeg 在自定义位置，在 `apps/server/.env` 中设置：
```env
FFMPEG_PATH=/path/to/ffmpeg
FFPROBE_PATH=/path/to/ffprobe
```

### Q: 端口被占用
A: 修改端口配置：
- Web: `apps/web/vite.config.ts` 中的 `server.port`
- Server: `apps/server/.env` 中的 `PORT`

## 开发建议

1. **编辑器插件**: 推荐安装 VSCode 扩展（见 `.vscode/extensions.json`）
2. **代码规范**: 提交前运行 `pnpm lint` 和 `pnpm type-check`
3. **日志查看**: 开发时保持终端可见，查看实时日志
4. **Git 提交**: 遵循 [贡献指南](CONTRIBUTING.md) 中的提交规范

## 下一步

- 查看 [架构文档](ARCHITECTURE.md) 了解项目结构
- 阅读各子项目的 README：
  - [Web 编辑器](apps/web/README.md)
  - [后端服务](apps/server/README.md)
  - [共享库](packages/shared/README.md)
- 参考 [贡献指南](CONTRIBUTING.md) 参与开发

## 获取帮助

如遇到问题：
1. 检查本文档的"常见问题"部分
2. 查看项目 issues
3. 创建新的 issue 描述问题

祝你使用愉快！🎉

