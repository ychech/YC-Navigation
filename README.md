# 🎨 艺术导航 (Artistic Nav)

> 专为设计师和创意工作者打造的极简导航网站

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)

## ✨ 特性

- 🎯 **极简设计** - 深色主题，优雅动画
- 🔍 **全局搜索** - 支持快捷键快速搜索
- 📱 **响应式** - 完美适配移动端和桌面端
- 🛠️ **后台管理** - 完整的分类和链接管理
- 📊 **访问统计** - 链接点击数据分析
- 🖼️ **画廊展示** - 支持图片展示功能
- 🌓 **深色模式** - 自动/手动切换
- 🔒 **安全加固** - 生产环境安全配置

## 🚀 快速开始

### 环境要求

- Node.js 18+
- SQLite (默认) 或 MySQL 8.0+
- Docker (可选)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置数据库和管理员密码

# 初始化数据库
npx prisma generate
npx prisma db push
npx prisma db seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

后台管理：http://localhost:3000/admin  
默认账号：`admin` / `admin123456`

## 📦 部署

### 四种部署方式

| 方式 | 适用场景 | 速度 |
|------|---------|------|
| **Docker 本地构建** | 推荐，服务器网络慢 | ⭐⭐⭐ |
| **Docker 服务器构建** | 服务器网络好 | ⭐⭐ |
| **PM2 直接部署** | 快速测试、低配置 | ⭐⭐⭐ |
| **镜像导入** | 多台服务器部署 | ⭐⭐⭐ |

### 一键部署

```bash
# Docker 方式（推荐）
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker

# PM2 方式
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s nodejs
```

### 详细部署文档

- [DEPLOY.md](./DEPLOY.md) - 完整部署指南
- [SECURITY.md](./SECURITY.md) - 安全加固指南

### 快速部署示例

**Docker 部署：**
```bash
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation/deploy
docker-compose up -d
```

**本地构建 + 上传：**
```bash
# 本地构建
docker build -f deploy/Dockerfile -t artistic-nav:latest .
docker save artistic-nav:latest > artistic-nav.tar

# 上传到服务器
scp artistic-nav.tar root@server:/opt/

# 服务器运行
ssh root@server "docker load < /opt/artistic-nav.tar && docker run -d -p 3000:3000 artistic-nav:latest"
```

## 🗂️ 项目结构

```
├── src/               # 源代码
│   ├── app/          # Next.js 页面和 API
│   ├── components/   # UI 组件
│   └── lib/          # 工具库
├── prisma/           # 数据库模型
├── public/           # 静态资源
├── deploy/           # Docker 部署配置
│   ├── Dockerfile
│   └── docker-compose.yml
├── DEPLOY.md         # 部署文档
├── SECURITY.md       # 安全指南
└── deploy.sh         # 一键部署脚本
```

## 🔧 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS + Framer Motion
- **数据库**: Prisma + SQLite/MySQL
- **部署**: Docker / PM2
- **安全**: 容器隔离、防火墙、Fail2ban

## 🛡️ 安全特性

- ✅ Docker 容器隔离
- ✅ 非 root 用户运行
- ✅ 安全响应头（X-Frame-Options, CSP 等）
- ✅ Fail2ban 防暴力破解
- ✅ 自动封禁恶意 IP
- ✅ 定期安全更新

详见 [SECURITY.md](./SECURITY.md)

## 📄 许可证

MIT
