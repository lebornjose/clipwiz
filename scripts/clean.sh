#!/bin/bash

echo "🧹 清理 ClipWiz 项目..."

# 清理根目录
echo "清理根目录 node_modules..."
rm -rf node_modules
rm -rf .pnpm-store

# 清理所有子包
echo "清理子包..."
pnpm -r clean

echo "✅ 清理完成！"

