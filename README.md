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

## 🛠️ 本地环境准备
- **后端**: Java 17+, Maven 3.9+。
- **前端**: Node.js 18+ (建议使用 pnpm 或 npm)。
- **密钥**: 需备好 DeepSeek API Key ([获取地址](https://platform.deepseek.com/))。

## 🏃 启动说明
1. **后端**: 
   - 在 `application.yml` 配置 API Key。
   - 运行 `./mvnw spring-boot:run` (默认端口 8080)。
2. **前端**: 
   - `npm install` 
   - `npm run dev` (默认端口 3000)。