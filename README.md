# Copywriter Generator (跨境电商多语言文案助手)

这是一个高性能全栈 AI 应用，旨在将原始商品描述一键转化为适配全球 10 大跨境电商平台的优化文案。

## 🚀 核心功能
- **多平台并发生成**：利用 Spring Boot 响应式编程，同时生成 Amazon, TikTok, Shopee 等多平台文案。
- **DeepSeek-V3 驱动**：极致性价比，深度优化的小语种生成质量。
- **流式交互体验**：基于 SSE (Server-Sent Events) 实现字字蹦出的实时预览。

## 📂 项目结构
- `/frontend-web`: Next.js 14 (App Router) + Tailwind CSS + Vercel AI SDK。
- `/backend-api`: Spring Boot 3.3 + Spring AI (OpenAI Starter)。
- `/docs`: 存放 `architecture.md` 和 `ai-prompts.md`。

## 🐳 Docker 部署（推荐）

### 快速开始

1. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 填入你的 DeepSeek API Key
nano .env
```

2. **一键部署**
```bash
./deploy.sh
```

3. **访问应用**
- 应用地址: http://localhost
- 健康检查: http://localhost/health

### 其他脚本

```bash
./logs.sh          # 查看所有服务日志
./logs.sh backend  # 查看后端日志
./status.sh        # 查看服务状态
./stop.sh          # 停止所有服务
./quick-restart.sh # 快速重启服务
./backup.sh        # 备份项目文件
```

详细部署文档请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ 本地开发环境

### 环境要求
- **后端**: Java 17+, Maven 3.9+
- **前端**: Node.js 18+ (建议使用 pnpm 或 npm)
- **密钥**: DeepSeek API Key ([获取地址](https://platform.deepseek.com/))

### 启动说明

#### Windows 环境（一键启动）
```bash
# 启动所有服务
start-all.bat

# 停止所有服务
stop-all.bat
```

#### 手动启动

1. **后端启动**
```bash
cd backend-api
cp .env.example .env
# 编辑 .env 配置 API Key
./mvnw spring-boot:run
```

2. **前端启动**
```bash
cd frontend-web
npm install
npm run dev
```

访问地址：
- 前端: http://localhost:3000
- 后端 API: http://localhost:8080/api

## 📖 文档

- [部署指南](./DEPLOYMENT.md) - Docker 部署完整文档
- [项目启动说明](./项目启动说明.md) - 本地开发环境启动指南

## 🌟 技术栈

### 后端
- Spring Boot 3.3.7
- Spring WebFlux (响应式编程)
- Spring AI (DeepSeek 集成)
- Spring Boot Actuator (健康检查)

### 前端
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Vercel AI SDK

### 部署
- Docker & Docker Compose
- Nginx (反向代理 + Gzip 压缩)
- 多阶段构建优化镜像大小

## 📊 性能优化

- ✅ Nginx Gzip 压缩（减少 60-80% 带宽）
- ✅ 静态资源缓存（Next.js 资源缓存 365 天）
- ✅ HTTP Keep-Alive 连接复用
- ✅ Docker 多阶段构建（最小化镜像大小）
- ✅ JVM 容器优化参数

## 🔧 开发工具

```bash
# 查看 Docker 日志
docker compose logs -f

# 重启服务
docker compose restart

# 查看资源使用
docker stats

# 清理无用镜像
docker image prune -f
```

## 📝 License

MIT License