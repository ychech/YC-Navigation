# Artistic Navigation - Docker 生产环境构建
# 使用非 root 用户运行，确保安全

FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# 依赖安装阶段
FROM base AS deps
COPY package.json ./
RUN npm install && npm cache clean --force

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/prisma/dev.db
RUN npx prisma generate
RUN npm run build

# 运行阶段 - 使用非 root 用户
FROM base AS runner
WORKDIR /app

# 创建非 root 用户和组
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p .next prisma public/uploads && \
    chown -R nextjs:nodejs /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/prisma/dev.db

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 切换到非 root 用户
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
