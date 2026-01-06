# 🚀 ClipWiz 快速参考

## 一键启动

```bash
# 1. 进入项目目录
cd /Users/huangxing/projects/super/clipWiz

# 2. 检查环境（可选）
./scripts/check-env.sh

# 3. 启动所有服务
pnpm dev
```

访问：
- 🌐 Web 编辑器：http://localhost:3000
- 🖥️  后端 API：http://localhost:4000

## 常用命令速查

### 开发
```bash
pnpm dev              # 启动所有服务
pnpm dev:web          # 只启动前端
pnpm dev:server       # 只启动后端
```

### 构建
```bash
pnpm build            # 构建所有
pnpm build:web        # 构建前端
pnpm build:server     # 构建后端
```

### 代码检查
```bash
pnpm lint             # ESLint
pnpm type-check       # TypeScript
```

### 清理
```bash
pnpm clean            # 清理所有
./scripts/clean.sh    # 深度清理
```

## API 速查表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传视频 |
| `/api/upload/multiple` | POST | 批量上传 |
| `/api/video/info/:id` | GET | 视频信息 |
| `/api/video/trim` | POST | 裁剪视频 |
| `/api/video/merge` | POST | 合并视频 |
| `/api/video/watermark` | POST | 添加水印 |
| `/api/video/transcode` | POST | 转码 |
| `/api/job/:id` | GET | 任务状态 |
| `/api/job` | GET | 任务列表 |
| `/api/job/:id` | DELETE | 取消任务 |

## 项目结构速览

```
clipWiz/
├── apps/
│   ├── web/          # React 前端
│   └── server/       # Node 后端
├── packages/
│   └── shared/       # 共享库
├── scripts/          # 工具脚本
└── docs/            # 文档
```

## 配置文件位置

- **后端环境变量**: `apps/server/.env`
- **前端代理配置**: `apps/web/vite.config.ts`
- **Workspace 配置**: `pnpm-workspace.yaml`
- **TypeScript 配置**: `tsconfig.json`

## 故障排查

### 端口被占用
```bash
# 修改端口
# 前端: apps/web/vite.config.ts -> server.port
# 后端: apps/server/.env -> PORT
```

### Redis 连接失败
```bash
# 启动 Redis
redis-server

# 检查状态
redis-cli ping  # 应返回 PONG
```

### FFmpeg 找不到
```bash
# 检查安装
ffmpeg -version

# 配置路径
# 编辑 apps/server/.env -> FFMPEG_PATH
```

## 文档索引

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目总览 |
| [GETTING_STARTED.md](GETTING_STARTED.md) | 详细安装 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 架构设计 |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | 项目总结 |
| [DELIVERY.md](DELIVERY.md) | 交付文档 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 贡献指南 |

## 环境要求

- ✅ Node.js >= 18.0.0
- ✅ pnpm >= 8.0.0  
- ✅ FFmpeg
- ⚠️  Redis (可选)

## 快速测试

### 测试后端
```bash
curl http://localhost:4000/health
# 应返回: {"status":"ok","message":"..."}
```

### 测试上传
```bash
curl -X POST -F "file=@test.mp4" http://localhost:4000/api/upload
```

### 测试视频信息
```bash
curl http://localhost:4000/api/video/info/FILE_ID
```

## 技术支持

遇到问题？查看：
1. 📘 [快速开始指南](GETTING_STARTED.md) 的"常见问题"
2. 📙 [架构文档](ARCHITECTURE.md) 了解实现细节
3. 🐛 创建 GitHub Issue

---

**快速链接**: [主 README](README.md) | [架构](ARCHITECTURE.md) | [交付文档](DELIVERY.md)

**最后更新**: 2026-01-06
