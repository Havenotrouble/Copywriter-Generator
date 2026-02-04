#!/bin/bash

# Copywriter Generator 快速启动脚本（用于测试部署）
# 不执行清理操作，适合快速重启

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}快速重启服务...${NC}"

# 重启服务
docker compose restart

# 等待服务启动
sleep 5

echo -e "${GREEN}服务已重启${NC}"
docker compose ps
