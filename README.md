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

## 🚀 快速开始

### 环境要求

- Node.js 18+
- SQLite (默认) 或 MySQL 8.0+

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

详见 [DEPLOY.md](./DEPLOY.md)

- **推荐**: Node.js + PM2 (适合 2C2G 服务器)
- **可选**: Docker (需要 4G+ 内存)

## 🗂️ 项目结构

```
├── src/               # 源代码
├── prisma/            # 数据库模型
├── public/            # 静态资源
├── deploy/            # Docker 部署配置
├── DEPLOY.md          # 部署文档
└── Dockerfile         # 容器构建
```

## 🔧 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS + Framer Motion
- **数据库**: Prisma + SQLite/MySQL
- **部署**: PM2 / Docker

## 📄 许可证

MIT
