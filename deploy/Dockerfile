# ============================================
# 艺术导航 - 生产环境 Dockerfile
# 优化项:
# - 多阶段构建，减小镜像体积
# - 使用非 root 用户运行
# - 健康检查
# ============================================

# 阶段 1: 依赖安装
FROM node:20-alpine AS deps

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 复制依赖配置
COPY package.json package-lock.json* ./

# 安装生产依赖（使用缓存）
RUN npm ci --only=production && npm cache clean --force

# 阶段 2: 构建应用
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源码
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 阶段 3: 生产运行
FROM node:20-alpine AS runner

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache curl ca-certificates

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 创建必要目录并设置权限
RUN mkdir -p /app/data /app/public/uploads /app/logs && \
    chown -R nextjs:nodejs /app

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma 相关文件
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 切换非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 启动命令
CMD ["node", "server.js"]
