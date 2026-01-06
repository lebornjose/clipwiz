# ClipWiz 项目结构

```
clipWiz/
├── apps/                           # 应用目录
│   ├── web/                       # Web 视频编辑器
│   │   ├── src/
│   │   │   ├── main.tsx          # 入口文件
│   │   │   ├── App.tsx           # 主应用组件
│   │   │   ├── App.css
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.ts        # Vite 配置
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── server/                    # 后端合成服务
│       ├── src/
│       │   ├── index.ts          # 入口文件
│       │   ├── routes/           # API 路由
│       │   │   ├── upload.ts    # 文件上传
│       │   │   ├── video.ts     # 视频处理
│       │   │   └── job.ts       # 任务管理
│       │   ├── services/         # 业务服务
│       │   │   ├── queue.ts     # 任务队列
│       │   │   └── videoProcessor.ts  # 视频处理
│       │   └── middleware/       # 中间件
│       │       └── errorHandler.ts
│       ├── tsconfig.json
│       ├── package.json
│       ├── .env.example
│       └── README.md
│
├── packages/                      # 共享包目录
│   └── shared/                   # 共享代码库
│       ├── src/
│       │   ├── index.ts         # 导出入口
│       │   ├── types.ts         # TypeScript 类型定义
│       │   ├── utils.ts         # 工具函数
│       │   └── constants.ts     # 常量定义
│       ├── tsconfig.json
│       ├── package.json
│       └── README.md
│
├── scripts/                       # 脚本目录
│   ├── setup.sh                  # 项目初始化脚本
│   └── clean.sh                  # 清理脚本
│
├── pnpm-workspace.yaml           # pnpm workspace 配置
├── package.json                  # 根 package.json
├── tsconfig.json                 # TypeScript 基础配置
├── .gitignore
├── .editorconfig
├── .cursorignore
├── README.md                     # 项目说明
├── LICENSE                       # MIT 许可证
├── CHANGELOG.md                  # 更新日志
└── CONTRIBUTING.md               # 贡献指南
```

## 架构说明

### Monorepo 结构

项目采用 pnpm workspace 管理 monorepo：

- **apps/web**: 前端 React 应用，提供可视化视频编辑界面
- **apps/server**: 后端 Node.js 服务，处理视频合成任务
- **packages/shared**: 共享代码库，被前后端共同使用

### 依赖关系

```
apps/web     → packages/shared
apps/server  → packages/shared
```

### 技术选型

#### 前端 (apps/web)
- **框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 库**: Ant Design
- **状态管理**: Zustand (待实现)
- **画布操作**: Fabric.js (待实现)
- **视频播放**: Video.js (待实现)

#### 后端 (apps/server)
- **运行时**: Node.js
- **框架**: Express
- **语言**: TypeScript
- **视频处理**: FFmpeg (fluent-ffmpeg)
- **任务队列**: Bull + Redis
- **文件上传**: Multer

#### 共享库 (packages/shared)
- **类型定义**: TypeScript interfaces & enums
- **工具函数**: 文件处理、时间格式化等
- **常量**: API 端点、配置项等

## 开发流程

1. 用户在 Web 编辑器中编辑视频
2. 点击导出时，前端发送任务到后端 API
3. 后端将任务加入 Bull 队列
4. Worker 从队列取出任务，使用 FFmpeg 处理视频
5. 处理完成后，返回结果给前端
6. 前端可以下载或预览处理后的视频

## 扩展性

### 可扩展点

1. **视频处理操作**: 在 `videoProcessor.ts` 中添加新的处理方法
2. **API 端点**: 在 `routes/` 目录添加新路由
3. **共享类型**: 在 `packages/shared/src/types.ts` 添加类型
4. **UI 组件**: 在 `apps/web/src/components/` 添加组件

### 性能优化方向

1. **队列优化**: 根据任务类型设置不同优先级
2. **缓存策略**: 对常用操作结果进行缓存
3. **视频预处理**: 上传时生成缩略图和预览
4. **并发控制**: 限制同时处理的任务数量
5. **CDN 集成**: 将处理后的视频上传到 CDN

