#!/bin/bash

echo "🔍 ClipWiz 项目环境检查"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查项计数
PASSED=0
FAILED=0

# 检查 Node.js
echo -n "检查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} $(node -v)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} 版本过低 (需要 >= 18.0.0)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} 未安装"
    ((FAILED++))
fi

# 检查 pnpm
echo -n "检查 pnpm... "
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓${NC} $(pnpm -v)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 未安装"
    echo -e "  ${YELLOW}安装命令: npm install -g pnpm${NC}"
    ((FAILED++))
fi

# 检查 Redis
echo -n "检查 Redis... "
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓${NC} 已安装且正在运行"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} 已安装但未运行"
        echo -e "  ${YELLOW}启动命令: redis-server${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} 未安装"
    echo -e "  ${YELLOW}macOS: brew install redis${NC}"
    echo -e "  ${YELLOW}Ubuntu: sudo apt install redis-server${NC}"
    ((FAILED++))
fi

# 检查 FFmpeg
echo -n "检查 FFmpeg... "
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n1 | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} $FFMPEG_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 未安装"
    echo -e "  ${YELLOW}macOS: brew install ffmpeg${NC}"
    echo -e "  ${YELLOW}Ubuntu: sudo apt install ffmpeg${NC}"
    ((FAILED++))
fi

# 检查项目依赖
echo -n "检查项目依赖... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} 已安装"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 未安装"
    echo -e "  ${YELLOW}运行: pnpm install${NC}"
    ((FAILED++))
fi

# 检查后端配置
echo -n "检查后端配置... "
if [ -f "apps/server/.env" ]; then
    echo -e "${GREEN}✓${NC} .env 文件存在"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} .env 文件不存在"
    echo -e "  ${YELLOW}运行: cd apps/server && cp .env.example .env${NC}"
    ((FAILED++))
fi

echo ""
echo "================================"
echo -e "检查完成: ${GREEN}通过 $PASSED${NC} / ${RED}失败 $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 环境检查全部通过！可以开始开发了${NC}"
    echo ""
    echo "启动开发服务器:"
    echo "  pnpm dev"
    exit 0
else
    echo -e "${YELLOW}⚠️  请先解决上述问题后再启动项目${NC}"
    exit 1
fi

