#!/bin/bash

# Copywriter Generator 备份脚本

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="copywriter-backup-${TIMESTAMP}.tar.gz"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}开始备份...${NC}"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份重要文件
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='target' \
    --exclude='*.log' \
    --exclude='.git' \
    backend-api/ \
    frontend-web/ \
    nginx.conf \
    docker-compose.yml \
    .env.example \
    *.sh \
    *.md

echo -e "${GREEN}备份完成: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"

# 清理旧备份（保留最近5个）
cd $BACKUP_DIR
ls -t copywriter-backup-*.tar.gz | tail -n +6 | xargs -r rm
cd ..

echo -e "${BLUE}旧备份已清理，保留最近5个备份${NC}"
ls -lh $BACKUP_DIR/
