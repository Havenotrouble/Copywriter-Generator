# 技术架构设计 (Architecture) - DeepSeek 并发流版

## 1. 技术栈选型
- **前端**: Next.js 14, TypeScript, Shadcn/UI (风格: Deep Navy & Action Orange)。
- **后端**: Spring Boot 3.3, Spring AI (OpenAI 兼容模式)。
- **模型**: DeepSeek-V3 (`deepseek-chat`)。

## 2. 数据交互逻辑
- **请求格式**: 
  POST `/api/generate` 携带 `{ content: string, platforms: string[], language: string }`。
- **并发策略**: 
  后端使用 `Flux.fromIterable(platforms).flatMap(...)` 为每个平台开启并发 AI 调用。
- **SSE 混合流协议**: 
  为了在单条流中区分多平台内容，数据封装为：`data: {"id": "amazon", "text": "..."}`。

## 3. 关键补丁与配置
- **跨域补丁**: Spring Boot 需配置 `CorsRegistry` 允许 `http://localhost:3000`。
- **流式响应**: 设置 `produces = MediaType.TEXT_EVENT_STREAM_VALUE`。
- **前端解析**: 使用原生 `ReadableStream` 解析器拆解混合 JSON 流，按 `id` 分发内容。