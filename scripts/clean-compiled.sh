#!/bin/bash

echo "🧹 清理 TypeScript 编译产物..."

# 删除 src 目录中的 .js 文件
find . -name "*.js" -path "*/src/*" -not -path "*/node_modules/*" -not -path "*/dist/*" -type f -delete

# 删除 .js.map 文件
find . -name "*.js.map" -not -path "*/node_modules/*" -not -path "*/dist/*" -type f -delete

# 删除 .tsbuildinfo 文件
find . -name "*.tsbuildinfo" -not -path "*/node_modules/*" -type f -delete

echo "✅ 清理完成！"
echo ""
echo "提示：这些文件是 TypeScript 编译产物，不应该在源代码目录中。"
echo "它们应该只存在于 dist/ 目录中。"

