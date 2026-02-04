# Copywriter Generator - 快速参考

## 常用命令

### Docker 部署
```bash
./deploy.sh          # 一键部署（构建+启动+清理）
./stop.sh            # 停止所有服务
./quick-restart.sh   # 快速重启
./status.sh          # 查看服务状态
./logs.sh            # 查看所有日志
./logs.sh backend    # 查看后端日志
./backup.sh          # 备份项目
```

### Docker Compose
```bash
docker compose up -d              # 启动服务
docker compose down               # 停止服务
docker compose restart            # 重启服务
docker compose ps                 # 查看状态
docker compose logs -f            # 查看日志
docker compose build --no-cache   # 重新构建镜像
```

### 服务访问
- 应用: http://localhost
- 健康检查: http://localhost/health
- 后端 API: http://localhost/api/*

### 故障排查
```bash
# 查看容器日志
docker compose logs backend -f
docker compose logs frontend -f
docker compose logs nginx -f

# 进入容器调试
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec nginx sh

# 查看资源使用
docker stats

# 清理无用镜像
docker image prune -f
docker system prune -f
```

### 环境配置
```bash
# 1. 复制环境变量模板
cp .env.example .env

# 2. 编辑配置
nano .env
# 或
vi .env

# 3. 填入 DeepSeek API Key
DEEPSEEK_API_KEY=your-key-here
```

## 目录结构
```
├── backend-api/          # 后端服务
│   ├── src/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend-web/         # 前端服务
│   ├── app/
│   ├── Dockerfile
│   └── .dockerignore
├── nginx.conf            # Nginx 配置
├── docker-compose.yml    # Docker 编排
├── deploy.sh             # 部署脚本
├── DEPLOYMENT.md         # 部署文档
└── README.md             # 项目说明
```

## 性能优化
- ✅ Gzip 压缩（减少 60-80% 带宽）
- ✅ 静态资源缓存
- ✅ HTTP Keep-Alive
- ✅ 容器资源限制
- ✅ 健康检查自动恢复

## 监控指标
```bash
# CPU/内存使用
docker stats --no-stream

# 磁盘使用
docker system df

# 网络流量
docker stats --format "table {{.Container}}\t{{.NetIO}}"
```

## 更新部署
```bash
# 方式1：使用部署脚本（推荐）
git pull
./deploy.sh

# 方式2：手动更新
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 备份恢复
```bash
# 备份
./backup.sh

# 恢复
tar -xzf backups/copywriter-backup-YYYYMMDD_HHMMSS.tar.gz
./deploy.sh
```
