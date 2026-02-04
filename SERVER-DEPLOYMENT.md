# Linux/Unix 服务器部署完整指南

## 📋 部署前准备

### 服务器要求
- 操作系统: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / 其他 Linux 发行版
- RAM: 至少 2GB（推荐 4GB）
- 磁盘: 至少 10GB 可用空间
- 网络: 稳定的互联网连接

---

## 第一步: 推送代码到 Git 仓库

### 1.1 检查 Git 远程仓库

```bash
cd D:/liziyi/codeprivate/Copywriter-Generator
git remote -v
```

### 1.2 添加远程仓库（如果还没有）

```bash
# GitHub
git remote add origin https://github.com/your-username/Copywriter-Generator.git

# 或 GitLab
git remote add origin https://gitlab.com/your-username/Copywriter-Generator.git

# 或 Gitee（国内）
git remote add origin https://gitee.com/your-username/Copywriter-Generator.git
```

### 1.3 推送代码

```bash
# 推送到主分支
git push -u origin master

# 或推送到 main 分支
git push -u origin main
```

---

## 第二步: 在服务器上安装 Docker

### 2.1 连接到服务器

```bash
# 使用 SSH 连接
ssh your-username@your-server-ip

# 或使用密钥
ssh -i /path/to/key.pem your-username@your-server-ip
```

### 2.2 安装 Docker（Ubuntu/Debian）

```bash
# 更新包索引
sudo apt update

# 安装必要的包
sudo apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
sudo docker compose version
```

### 2.3 安装 Docker（CentOS/RHEL）

```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
sudo docker compose version
```

### 2.4 允许非 root 用户运行 Docker（可选但推荐）

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或运行以下命令使更改生效
newgrp docker

# 验证（不需要 sudo）
docker ps
```

---

## 第三步: 克隆项目到服务器

```bash
# 进入合适的目录（例如 /opt 或用户主目录）
cd ~

# 克隆项目（替换为你的仓库地址）
git clone https://github.com/your-username/Copywriter-Generator.git

# 进入项目目录
cd Copywriter-Generator

# 查看文件
ls -la
```

---

## 第四步: 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
# 或使用 vi
vi .env
```

**编辑内容**（填入你的实际 API Key）：
```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=sk-your-actual-api-key-here

# Allowed Origins for CORS
ALLOWED_ORIGINS=http://your-server-ip,http://your-domain.com
```

保存并退出：
- nano: 按 `Ctrl+X`, 然后 `Y`, 然后 `Enter`
- vi: 按 `ESC`, 输入 `:wq`, 按 `Enter`

---

## 第五步: 一键部署

```bash
# 确保脚本有执行权限（应该已经有了）
chmod +x *.sh

# 运行一键部署脚本
./deploy.sh
```

**部署过程说明**：
1. ✅ 检查 Docker 环境
2. ✅ 停止旧服务（如有）
3. ✅ 构建镜像（首次大约需要 3-5 分钟）
4. ✅ 启动所有服务
5. ✅ 等待健康检查
6. ✅ 自动清理无用镜像

---

## 第六步: 验证部署

### 6.1 检查服务状态

```bash
# 使用我们的状态脚本
./status.sh

# 或使用 Docker Compose
docker compose ps

# 预期输出：所有服务状态为 Up (healthy)
```

### 6.2 健康检查

```bash
# 运行健康检查脚本
./health-check.sh

# 或手动检查
curl http://localhost/health
# 预期输出: healthy

curl http://localhost/api/actuator/health
# 预期输出: {"status":"UP"}
```

### 6.3 查看日志

```bash
# 查看所有服务日志
./logs.sh

# 或查看特定服务
./logs.sh backend
./logs.sh frontend
./logs.sh nginx

# 使用 make 命令（如果支持）
make logs
make logs-backend
```

### 6.4 浏览器访问

在浏览器中访问：
- `http://your-server-ip` - 应该能看到前端页面
- `http://your-server-ip/health` - 应该显示 "healthy"

---

## 第七步: 配置防火墙（如需要）

### Ubuntu/Debian (ufw)

```bash
# 允许 HTTP
sudo ufw allow 80/tcp

# 如果使用 HTTPS
sudo ufw allow 443/tcp

# 允许 SSH（确保不被锁在外面）
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable

# 检查状态
sudo ufw status
```

### CentOS/RHEL (firewalld)

```bash
# 允许 HTTP 和 HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重载防火墙
sudo firewall-cmd --reload

# 检查状态
sudo firewall-cmd --list-all
```

### 云服务器安全组

如果使用云服务器（AWS, 阿里云, 腾讯云等），还需要在控制台配置安全组：
- 开放入站规则: TCP 80 (HTTP)
- 开放入站规则: TCP 443 (HTTPS，如需要)

---

## 🎯 常用管理命令

```bash
# 查看状态
./status.sh
# 或
make status

# 查看日志
./logs.sh
make logs

# 重启服务
./quick-restart.sh
make restart

# 停止服务
./stop.sh
make stop

# 健康检查
./health-check.sh
make health

# 备份项目
./backup.sh
make backup

# 清理无用镜像
make clean
```

---

## 🔄 更新部署

当代码有更新时：

```bash
# 1. 备份当前版本
./backup.sh

# 2. 拉取最新代码
git pull

# 3. 重新部署
./deploy.sh

# 4. 验证
./health-check.sh
```

---

## 🔧 故障排查

### 问题 1: 端口 80 被占用

```bash
# 查看占用端口的进程
sudo netstat -tulpn | grep :80

# 停止占用的进程
sudo systemctl stop apache2  # 或 nginx

# 或修改 docker-compose.yml 使用其他端口
# 将 "80:80" 改为 "8080:80"
```

### 问题 2: 容器启动失败

```bash
# 查看详细日志
docker compose logs backend --tail=100
docker compose logs frontend --tail=100

# 检查镜像是否构建成功
docker images | grep copywriter

# 重新构建
docker compose build --no-cache
docker compose up -d
```

### 问题 3: 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理 Docker 资源
docker system prune -a --volumes -f

# 查看 Docker 磁盘使用
docker system df
```

### 问题 4: 内存不足

```bash
# 查看内存使用
free -h

# 调整 JVM 参数（修改 backend-api/Dockerfile）
# ENV JAVA_OPTS="-Xms128m -Xmx256m"

# 限制容器资源（修改 docker-compose.yml）
```

---

## 🔐 安全建议

### 1. 使用环境变量

```bash
# 确保 .env 文件权限正确
chmod 600 .env

# 不要将 .env 提交到 Git
# （已在 .gitignore 中配置）
```

### 2. 配置 HTTPS

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Docker
sudo apt install --only-upgrade docker-ce docker-ce-cli containerd.io
```

---

## 📊 性能优化（可选）

### 1. 启用 Docker 日志轮转

创建 `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

重启 Docker:
```bash
sudo systemctl restart docker
```

### 2. 配置系统限制

编辑 `/etc/sysctl.conf`:
```
# 增加最大打开文件数
fs.file-max = 65535

# 优化网络
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
```

应用配置:
```bash
sudo sysctl -p
```

---

## ✅ 部署完成检查清单

部署完成后，确认以下项目：

- [ ] Docker 已安装并运行
- [ ] 项目已克隆到服务器
- [ ] .env 文件已正确配置
- [ ] ./deploy.sh 执行成功
- [ ] 所有容器状态为 healthy
- [ ] 浏览器可访问前端页面
- [ ] 健康检查通过
- [ ] 防火墙/安全组已配置
- [ ] 日志正常输出
- [ ] 已配置定期备份

---

## 🆘 需要帮助？

如遇到问题，请收集以下信息：

```bash
# 系统信息
uname -a
cat /etc/os-release

# Docker 版本
docker --version
docker compose version

# 服务状态
docker compose ps

# 日志
docker compose logs --tail=100

# 资源使用
docker stats --no-stream
free -h
df -h
```

---

**恭喜！服务器部署完成！** 🎉

访问地址: `http://your-server-ip`
