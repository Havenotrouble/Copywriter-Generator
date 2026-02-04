# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 创建非 root 用户
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
RUN chown -R nextjs:nodejs /app
USER nextjs:nodejs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["npm", "start"]
