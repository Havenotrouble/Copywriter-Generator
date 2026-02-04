#!/bin/bash

# Copywriter Generator 健康检查脚本

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "================================================================"
echo -e "${BLUE}Copywriter Generator 健康检查${NC}"
echo "================================================================"

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker 未运行${NC}"
    exit 1
fi

# 检查服务是否启动
echo -e "\n${BLUE}检查服务状态...${NC}"

SERVICES=("backend" "frontend" "nginx")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    CONTAINER=$(docker compose ps -q $service)

    if [ -z "$CONTAINER" ]; then
        echo -e "${RED}❌ $service: 未运行${NC}"
        ALL_HEALTHY=false
        continue
    fi

    # 检查容器状态
    STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER)
    if [ "$STATUS" != "running" ]; then
        echo -e "${RED}❌ $service: 状态异常 ($STATUS)${NC}"
        ALL_HEALTHY=false
        continue
    fi

    # 检查健康状态
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER 2>/dev/null || echo "none")

    if [ "$HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✅ $service: 健康${NC}"
    elif [ "$HEALTH" = "none" ]; then
        echo -e "${YELLOW}⚠️  $service: 运行中（无健康检查）${NC}"
    else
        echo -e "${RED}❌ $service: 不健康 ($HEALTH)${NC}"
        ALL_HEALTHY=false
    fi
done

# 检查端口
echo -e "\n${BLUE}检查端口...${NC}"

if nc -z localhost 80 2>/dev/null || curl -s http://localhost/health &>/dev/null; then
    echo -e "${GREEN}✅ Nginx (端口 80): 正常${NC}"
else
    echo -e "${RED}❌ Nginx (端口 80): 无法访问${NC}"
    ALL_HEALTHY=false
fi

# 检查后端 API
echo -e "\n${BLUE}检查后端 API...${NC}"

if curl -s http://localhost/api/health &>/dev/null || curl -s http://localhost:8080/actuator/health &>/dev/null; then
    echo -e "${GREEN}✅ 后端 API: 正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端 API: 可能无 /health 端点${NC}"
fi

# 检查前端
echo -e "\n${BLUE}检查前端...${NC}"

if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ 前端: 正常${NC}"
else
    echo -e "${RED}❌ 前端: 无法访问${NC}"
    ALL_HEALTHY=false
fi

# 检查资源使用
echo -e "\n${BLUE}资源使用情况...${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker compose ps -q) 2>/dev/null || true

echo "================================================================"

if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}✅ 所有服务健康${NC}"
    exit 0
else
    echo -e "${RED}❌ 部分服务不健康，请检查日志${NC}"
    echo -e "${YELLOW}查看日志: docker compose logs -f${NC}"
    exit 1
fi
