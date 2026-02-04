# Docker 部署指南

## 📋 部署前准备

### 1. 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- Linux/Unix 操作系统（推荐 Ubuntu 20.04+）
- 至少 2GB RAM 和 10GB 磁盘空间

### 2. 配置环境变量

在 `backend-api` 目录创建 `.env` 文件：

```bash
cd backend-api
cp .env.example .env
```

编辑 `.env` 文件，填入你的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your-actual-api-key-here
```

## 🚀 一键部署

### 快速部署

在项目根目录执行：

```bash
./deploy.sh
```

部署脚本会自动完成：
1. ✅ 检查 Docker 环境
2. ✅ 停止旧服务
3. ✅ 构建最新镜像
4. ✅ 启动所有服务
5. ✅ 等待健康检查
6. ✅ 清理无用镜像释放空间

### Windows 环境部署

在 Windows 上使用 Git Bash 或 WSL2：

```bash
# Git Bash
bash deploy.sh

# WSL2
wsl ./deploy.sh
```

## 📦 手动部署步骤

如果需要手动控制部署流程：

### 1. 停止现有服务

```bash
docker compose down
```

### 2. 构建镜像

```bash
# 构建所有服务
docker compose build

# 或单独构建
docker compose build backend
docker compose build frontend
```

### 3. 启动服务

```bash
# 后台运行
docker compose up -d

# 前台运行（查看日志）
docker compose up
```

### 4. 查看服务状态

```bash
docker compose ps
```

### 5. 查看日志

```bash
# 所有服务日志
docker compose logs -f

# 查看特定服务
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

## 🌐 访问应用

部署成功后：

- **应用主页**: http://your-server-ip
- **健康检查**: http://your-server-ip/health
- **后端 API**: http://your-server-ip/api/*

## 🔧 服务管理

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启单个服务
docker compose restart backend
docker compose restart frontend
docker compose restart nginx
```

### 停止服务

```bash
docker compose down
```

### 更新服务

```bash
# 方法1：使用部署脚本（推荐）
./deploy.sh

# 方法2：手动更新
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 查看资源使用

```bash
# 容器资源使用
docker stats

# 磁盘使用
docker system df
```

## 🧹 清理操作

### 清理无用镜像

```bash
# 清理悬空镜像
docker image prune -f

# 清理所有未使用的镜像（谨慎使用）
docker image prune -a
```

### 清理容器和网络

```bash
# 清理停止的容器
docker container prune -f

# 清理未使用的网络
docker network prune -f
```

### 清理卷（会删除数据，谨慎使用）

```bash
docker volume prune -f
```

### 一键清理所有未使用资源

```bash
docker system prune -a --volumes -f
```

## 🔍 故障排查

### 1. 服务启动失败

```bash
# 查看详细日志
docker compose logs backend
docker compose logs frontend

# 检查容器状态
docker compose ps
```

### 2. 端口冲突

如果 80 端口被占用，修改 `docker-compose.yml`：

```yaml
nginx:
  ports:
    - "8000:80"  # 改为其他端口
```

### 3. 内存不足

修改后端 JVM 参数，在 `backend-api/Dockerfile` 中：

```dockerfile
ENV JAVA_OPTS="-Xms128m -Xmx256m -XX:+UseContainerSupport"
```

### 4. 构建失败

```bash
# 清理构建缓存重新构建
docker compose build --no-cache
```

### 5. Nginx 配置错误

```bash
# 测试配置文件
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx:1.25-alpine nginx -t

# 重新加载配置
docker compose exec nginx nginx -s reload
```

## 📊 性能优化

### Gzip 压缩

Nginx 已启用 Gzip 压缩（`nginx.conf` 中配置），可减少 60-80% 的传输数据量。

### 静态资源缓存

- Next.js 静态资源缓存 365 天
- 其他静态资源缓存 7 天
- API 请求不缓存

### 连接优化

- 启用 HTTP Keep-Alive
- 上游连接池（keepalive 32）
- TCP 优化（tcp_nopush、tcp_nodelay）

## 🔐 安全建议

### 1. 使用 HTTPS

推荐使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com
```

### 2. 环境变量管理

- 不要将 `.env` 文件提交到 Git
- 使用 Docker secrets 或环境变量管理工具

### 3. 限流配置

在 `nginx.conf` 中添加限流：

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ...
}
```

## 📈 监控和日志

### 查看实时日志

```bash
# 持续查看所有服务日志
docker compose logs -f --tail=100

# 只看错误日志
docker compose logs -f | grep -i error
```

### 日志轮转

Nginx 日志挂载到 Docker 卷，建议配置日志轮转：

```bash
# 创建 logrotate 配置
cat > /etc/logrotate.d/docker-nginx <<EOF
/var/lib/docker/volumes/copywriter-generator_nginx-logs/_data/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 nginx nginx
    sharedscripts
    postrotate
        docker compose exec nginx nginx -s reopen
    endscript
}
EOF
```

## 🌍 曼谷服务器优化建议

由于部署在曼谷服务器，已做以下优化：

1. ✅ **Gzip 压缩** - 减少 60-80% 带宽使用
2. ✅ **静态资源缓存** - 减少重复传输
3. ✅ **HTTP Keep-Alive** - 减少连接开销
4. ✅ **连接池** - 提高并发性能

## 🆘 获取帮助

如遇到问题：

1. 查看日志：`docker compose logs -f`
2. 检查状态：`docker compose ps`
3. 查看资源：`docker stats`
4. 重新部署：`./deploy.sh`

## 📝 后续优化

可选的进一步优化：

- 配置 CDN 加速静态资源
- 使用 Redis 缓存 API 响应
- 配置 APM 监控（如 Prometheus + Grafana）
- 设置自动备份和恢复
- 配置 CI/CD 自动部署
