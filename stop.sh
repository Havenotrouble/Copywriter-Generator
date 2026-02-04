#!/bin/bash

# Copywriter Generator 停止脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}停止所有服务...${NC}"

# 停止服务
docker compose down

echo -e "${GREEN}所有服务已停止${NC}"

# 显示停止后的状态
echo -e "\n${BLUE}当前运行的容器:${NC}"
docker ps --filter "name=copywriter" || echo "无相关容器运行"
