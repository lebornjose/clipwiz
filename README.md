# ClipWiz - 视频编辑与合成平台

<div align="center">

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

一个功能完整的视频编辑和合成平台，采用现代化的 pnpm monorepo 架构

[快速开始](GETTING_STARTED.md) • [架构文档](ARCHITECTURE.md) • [贡献指南](CONTRIBUTING.md) • [项目总结](PROJECT_SUMMARY.md)

</div>

---

## ✨ 特性

- 🎬 **现代化 Web 视频编辑器** - 基于 React + TypeScript + Vite
- ⚡ **高性能后端处理** - Node.js + Express + FFmpeg
- 🔄 **异步任务队列** - Bull + Redis 实现可靠的任务处理
- 📦 **Monorepo 架构** - pnpm workspace 管理多包项目
- 🎯 **完整的 TypeScript 支持** - 全栈类型安全
- 🛠️ **开箱即用** - 完整的开发环境配置

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) >= 8.0.0
- [Redis](https://redis.io/)
- [FFmpeg](https://ffmpeg.org/)

### 安装

```bash
# 1. 安装依赖
pnpm install

# 2. 配置后端环境变量
cd apps/server
cp .env.example .env

# 3. 启动 Redis（如果还未运行）
redis-server

# 4. 启动开发服务器
pnpm dev
```

访问：
- Web 编辑器：http://localhost:3000
- 后端 API：http://localhost:4000

📖 详细安装指南请查看 [快速开始文档](GETTING_STARTED.md)

## 📁 项目结构

```
clipWiz/
├── apps/
│   ├── web/              # Web 视频编辑器
│   │   ├── src/          # React 源码
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── server/           # 后端合成服务
│       ├── src/
│       │   ├── routes/   # API 路由
│       │   ├── services/ # 业务逻辑（视频处理、队列）
│       │   └── middleware/
│       └── package.json
├── packages/
│   └── shared/           # 共享类型定义和工具函数
│       └── src/
├── scripts/              # 工具脚本
├── pnpm-workspace.yaml   # Workspace 配置
└── package.json
```
## 截图
[1.png]

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI 组件**: Ant Design
- **状态管理**: Zustand (规划中)
- **视频播放**: webgl
- **视频轨道**: react-timeline-editor
- **字幕花子**: paglib(https://github.com/Tencent/libpag/blob/main/web/README.zh_CN.md  | https://pag.io/apis/web/modules/pag_text_layer.html)
  
### 后端
- **运行时**: Node.js 18+
- **框架**: Express
- **视频处理**: FFmpeg (fluent-ffmpeg)
- **任务队列**: Bull + Redis
- **文件上传**: Multer
- **语言**: TypeScript

### 共享
- **类型定义**: 统一的 TypeScript 接口
- **工具函数**: 文件处理、时间格式化等
- **常量配置**: API 端点、格式定义等

## 📚 API 端点

### 上传
- `POST /api/upload` - 上传单个视频
- `POST /api/upload/multiple` - 上传多个视频

### 视频处理
- `GET /api/video/info/:fileId` - 获取视频信息
- `POST /api/video/trim` - 裁剪视频
- `POST /api/video/merge` - 合并多个视频
- `POST /api/video/watermark` - 添加水印
- `POST /api/video/transcode` - 视频转码

### 任务管理
- `GET /api/job/:jobId` - 获取任务状态
- `GET /api/job` - 获取所有任务
- `DELETE /api/job/:jobId` - 取消任务

## 🎯 核心功能

### Web 视频编辑器
- ✅ 视频上传与管理
- ✅ 可视化操作界面
- ⏳ 时间轴编辑
- ⏳ 实时预览
- ⏳ 多轨道支持
- ⏳ 特效和滤镜

### 后端合成服务
- ✅ 视频裁剪和分割
- ✅ 多视频合并
- ✅ 文字水印
- ✅ 格式转码
- ✅ 任务队列系统
- ✅ 进度追踪

## 📜 可用命令

```bash
# 开发
pnpm dev              # 启动所有服务
pnpm dev:web          # 只启动 Web 编辑器
pnpm dev:server       # 只启动后端服务

# 构建
pnpm build            # 构建所有项目
pnpm build:web        # 构建 Web 编辑器
pnpm build:server     # 构建后端服务

# 代码质量
pnpm lint             # 运行 ESLint
pnpm type-check       # TypeScript 类型检查

# 清理
pnpm clean            # 清理所有构建产物和依赖
```

## 📖 文档

- 📘 [快速开始指南](GETTING_STARTED.md) - 详细的安装和配置说明
- 📙 [架构文档](ARCHITECTURE.md) - 项目架构和设计说明
- 📗 [贡献指南](CONTRIBUTING.md) - 如何参与项目开发
- 📕 [项目总结](PROJECT_SUMMARY.md) - 项目概览和开发计划
- 📄 [更新日志](CHANGELOG.md) - 版本更新记录

### 子项目文档
- [Web 编辑器](apps/web/README.md)
- [后端服务](apps/server/README.md)
- [共享库](packages/shared/README.md)

## 🔧 开发工具脚本

```bash
# 项目初始化（检查依赖并安装）
./scripts/setup.sh

# 清理所有 node_modules 和构建产物
./scripts/clean.sh
```

## 🤝 参与贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发路线图

### 短期目标
- [ ] 集成 Video.js 播放器
- [ ] 实现时间轴拖拽功能
- [ ] 添加视频预览功能
- [ ] 实现拖拽上传

### 中期目标
- [ ] 多轨道编辑
- [ ] 转场效果
- [ ] 滤镜和特效
- [ ] WebSocket 进度推送
- [ ] 用户认证系统

### 长期目标
- [ ] 云端部署
- [ ] 移动端支持
- [ ] AI 智能剪辑
- [ ] 协作功能

## ⚠️ 注意事项

1. **FFmpeg**: 确保系统已安装 FFmpeg 并配置正确路径
2. **Redis**: 任务队列依赖 Redis，需要保持 Redis 服务运行
3. **文件存储**: 默认存储在本地，生产环境建议使用对象存储
4. **资源限制**: 根据服务器配置调整并发任务数量

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

感谢所有开源项目和贡献者！

---

<div align="center">

**[⬆ 回到顶部](#clipwiz---视频编辑与合成平台)**

Made with ❤️ by ClipWiz Team

</div>
