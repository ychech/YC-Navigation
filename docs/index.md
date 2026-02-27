---
layout: home

hero:
  name: Artistic Nav
  text: 艺术导航
  tagline: 专为设计师和创意工作者打造的极简导航网站
  image:
    src: /logo.svg
    alt: Artistic Nav
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 部署指南
      link: /deploy/quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/ychech/YC-Navigation

features:
  - icon: 🎯
    title: 极简设计
    details: 深色主题，优雅动画，为设计师打造的视觉体验
  - icon: 🔍
    title: 全局搜索
    details: 支持快捷键快速搜索，快速找到所需资源
  - icon: 📱
    title: 响应式
    details: 完美适配移动端和桌面端，随时随地访问
  - icon: 🛠️
    title: 后台管理
    details: 完整的分类和链接管理功能，轻松维护
  - icon: 📊
    title: 访问统计
    details: 链接点击数据分析，了解用户偏好
  - icon: 🖼️
    title: 画廊展示
    details: 支持图片展示功能，展示创意作品
  - icon: 🌓
    title: 深色模式
    details: 自动/手动切换，保护眼睛
  - icon: 🔒
    title: 安全加固
    details: 生产环境安全配置，防攻击加固
---

## 🚀 快速安装

::: code-group

```bash [Docker 一键部署]
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

```bash [PM2 一键部署]
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s nodejs
```

```bash [本地开发]
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation
npm install && npm run dev
```

:::

## 🛠️ 技术栈

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square)](https://tailwindcss.com/)

</div>

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

## 📄 许可证

[MIT](https://github.com/ychech/YC-Navigation/blob/main/LICENSE)
