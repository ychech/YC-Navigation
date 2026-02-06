# ============================================
# 艺术导航 - 生产环境 Dockerfile
# 适用于: 有足够内存的服务器 (建议 4G+)
# ============================================

# 阶段 1: 依赖安装 (包含 devDependencies 用于构建)
FROM node:20-alpine AS deps
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat openssl

# 复制依赖配置
COPY package.json package-lock.json* ./

# 安装所有依赖 (包括 devDependencies，用于构建)
RUN npm ci && npm cache clean --force

# 阶段 2: 构建应用
FROM node:20-alpine AS builder
WORKDIR /app

# 从 deps 阶段复制所有依赖
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

# 安装 curl 用于健康检查
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
RUN mkdir -p /app/prisma /app/public/uploads /app/logs && \
    chown -R nextjs:nodejs /app

# 复制构建产物 (standalone 模式)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma 相关文件 (运行时需要)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 复制 package.json (用于 prisma db 命令)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# 切换非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 启动命令
CMD ["node", "server.js"]
