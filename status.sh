#!/bin/bash

# Copywriter Generator 状态查看脚本

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================================"
echo -e "${GREEN}Copywriter Generator 服务状态${NC}"
echo "================================================================"

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}Docker 未运行${NC}"
    exit 1
fi

# 显示容器状态
echo -e "\n${BLUE}容器状态:${NC}"
docker compose ps

# 显示资源使用
echo -e "\n${BLUE}资源使用:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" \
    $(docker compose ps -q) 2>/dev/null || echo "无容器运行"

# 显示磁盘使用
echo -e "\n${BLUE}磁盘使用:${NC}"
docker system df

# 显示网络
echo -e "\n${BLUE}网络状态:${NC}"
docker network ls --filter "name=copywriter"

echo "================================================================"
