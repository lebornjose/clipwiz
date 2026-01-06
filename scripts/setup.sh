#!/bin/bash

echo "🚀 开始安装 ClipWiz 项目依赖..."

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null
then
    echo "❌ pnpm 未安装，请先安装 pnpm:"
    echo "   npm install -g pnpm"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 >= 18.0.0"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ pnpm 版本: $(pnpm -v)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
pnpm install

echo ""
echo "✅ 依赖安装完成！"
echo ""
echo "📋 后续步骤："
echo "   1. 确保已安装 Redis (用于任务队列)"
echo "   2. 确保已安装 FFmpeg (用于视频处理)"
echo "   3. 配置后端环境变量: cd apps/server && cp .env.example .env"
echo "   4. 启动开发服务器: pnpm dev"
echo ""

