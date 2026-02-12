# Artistic Navigation - 部署指南

## 🚀 快速开始（推荐）

### 方式一：Docker Compose（最简单）

```bash
# 1. 克隆代码
git clone https://github.com/yourusername/artistic-nav.git
cd artistic-nav

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置你的配置

# 3. 一键部署
./deploy.sh
```

部署完成后访问：
- 前台：http://your-server-ip
- 后台：http://your-server-ip/admin
- 默认密码：查看 `.env` 文件中的 `ADMIN_PASSWORD`

### 方式二：手动 Docker 部署

```bash
# 1. 构建镜像
docker compose build

# 2. 启动服务
docker compose up -d

# 3. 初始化数据库
docker compose exec app npx prisma migrate deploy
```

## 📁 目录结构

```
artistic-nav/
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile              # Docker 镜像构建
├── deploy.sh               # 部署脚本
├── deploy/
│   └── nginx.conf          # Nginx 配置
├── prisma/
│   └── schema.prisma       # 数据库模型
└── .env.example            # 环境变量示例
```

## 🔧 常用命令

```bash
# 查看状态
./deploy.sh

# 查看日志
./deploy.sh logs

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 更新代码后重新部署
./deploy.sh update
```

## 🔒 安全说明

1. **非 root 用户运行**：容器使用 `nextjs` 用户（UID 1001）运行，降低安全风险
2. **数据持久化**：数据库和上传文件使用 Docker 卷持久化
3. **环境变量**：敏感信息通过 `.env` 文件配置，不提交到代码仓库

## 🐛 故障排查

### 数据库权限问题
```bash
# 修复权限
docker compose exec app chown -R nextjs:nodejs /app/prisma
```

### 上传失败
```bash
# 检查上传目录权限
docker compose exec app ls -la /app/public/uploads
```

### 查看日志
```bash
docker compose logs -f app
docker compose logs -f nginx
```

## 📝 更新代码

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新部署
./deploy.sh update
```
