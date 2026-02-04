# 部署前检查清单

## ✅ 部署前准备

### 1. 环境检查
- [ ] 服务器已安装 Docker (20.10+)
- [ ] 服务器已安装 Docker Compose (2.0+)
- [ ] 服务器有足够的资源 (推荐: 2GB RAM, 10GB 磁盘)
- [ ] 已获取 DeepSeek API Key

### 2. 配置文件
- [ ] 复制 `.env.example` 为 `.env`
- [ ] 在 `.env` 中填入正确的 `DEEPSEEK_API_KEY`
- [ ] 如需自定义域名，修改 `docker-compose.yml` 中的 `ALLOWED_ORIGINS`
- [ ] 检查 `nginx.conf` 中的域名配置（如使用域名）

### 3. 端口检查
- [ ] 确认 80 端口未被占用
- [ ] 如需 HTTPS，确认 443 端口未被占用
- [ ] 检查防火墙规则允许相应端口访问

### 4. 文件权限
- [ ] 所有 `.sh` 脚本具有执行权限
```bash
chmod +x *.sh
```

## 🚀 部署步骤

### 标准部署流程
```bash
# 1. 克隆项目到服务器
git clone <your-repo-url>
cd Copywriter-Generator

# 2. 配置环境变量
cp .env.example .env
nano .env  # 填入 API Key

# 3. 一键部署
./deploy.sh

# 4. 健康检查
./health-check.sh
```

### 快速命令（使用 Makefile）
```bash
# 部署
make deploy

# 健康检查
make health

# 查看状态
make status

# 查看日志
make logs
```

## 🔍 部署后验证

### 1. 服务状态检查
```bash
docker compose ps
```
预期输出：所有服务状态为 `Up (healthy)`

### 2. 健康检查
```bash
curl http://localhost/health
```
预期输出：`healthy`

### 3. 后端 API 检查
```bash
curl http://localhost/api/actuator/health
```
预期输出：`{"status":"UP"}`

### 4. 前端访问检查
在浏览器中访问：`http://your-server-ip`
应能看到前端页面

### 5. 资源使用检查
```bash
docker stats --no-stream
```
确认内存和 CPU 使用在合理范围内

## 📊 性能验证

### 1. Gzip 压缩验证
```bash
curl -H "Accept-Encoding: gzip" -I http://localhost
```
检查响应头中是否包含 `Content-Encoding: gzip`

### 2. 静态资源缓存验证
```bash
curl -I http://localhost/_next/static/some-file.js
```
检查 `Cache-Control` 头

### 3. 响应时间测试
```bash
time curl http://localhost
```

## 🔐 安全检查

### 1. 环境变量保护
- [ ] `.env` 文件不在 Git 仓库中
- [ ] API Key 未暴露在代码中
- [ ] 生产环境使用独立的 API Key

### 2. CORS 配置
- [ ] `ALLOWED_ORIGINS` 设置了正确的域名
- [ ] 没有使用 `*` 通配符（生产环境）

### 3. 日志级别
- [ ] 生产环境使用 `INFO` 或 `WARN` 级别
- [ ] 敏感信息不记录在日志中

## 🛠️ 常见问题排查

### 问题 1: 容器启动失败
```bash
# 查看日志
docker compose logs backend
docker compose logs frontend

# 检查端口占用
netstat -tulpn | grep :80
netstat -tulpn | grep :8080
```

### 问题 2: 健康检查失败
```bash
# 进入容器检查
docker compose exec backend sh
docker compose exec frontend sh

# 手动测试健康检查端点
curl http://backend:8080/actuator/health
curl http://frontend:3000
```

### 问题 3: Nginx 502 错误
```bash
# 检查 Nginx 日志
docker compose logs nginx

# 检查后端是否运行
docker compose ps backend

# 测试 Nginx 配置
docker compose exec nginx nginx -t
```

### 问题 4: 内存不足
```bash
# 查看资源使用
docker stats

# 调整 JVM 参数（修改 backend-api/Dockerfile）
ENV JAVA_OPTS="-Xms128m -Xmx256m"

# 重新构建
docker compose build --no-cache backend
docker compose up -d
```

## 📝 部署后任务

### 必做项
- [ ] 配置日志轮转
- [ ] 设置自动备份计划
- [ ] 配置监控告警
- [ ] 记录访问地址和凭证

### 推荐项
- [ ] 配置 HTTPS (Let's Encrypt)
- [ ] 配置域名解析
- [ ] 设置 CDN 加速
- [ ] 配置自动更新脚本

## 🔄 更新部署流程

```bash
# 1. 备份当前版本
./backup.sh

# 2. 拉取最新代码
git pull

# 3. 重新部署
./deploy.sh

# 4. 验证部署
./health-check.sh
```

## 📞 获取帮助

如遇到问题，请提供以下信息：
1. 服务器环境 (OS, Docker 版本)
2. 错误日志 (`docker compose logs`)
3. 服务状态 (`docker compose ps`)
4. 资源使用 (`docker stats`)

## ✅ 部署完成确认

完成以下检查后，部署即告完成：
- [ ] 所有服务运行正常
- [ ] 健康检查通过
- [ ] 前端可访问
- [ ] 后端 API 响应正常
- [ ] Gzip 压缩生效
- [ ] 日志正常输出
- [ ] 资源使用合理
- [ ] 已配置备份
- [ ] 已记录访问信息

恭喜！部署成功！🎉
