# 简介

Artistic Nav 是一个专为设计师和创意工作者打造的极简导航网站。它提供了优雅的界面、强大的功能和简单的部署方式。

## ✨ 特性

- 🎯 **极简设计** - 深色主题，优雅动画
- 🔍 **全局搜索** - 支持快捷键快速搜索
- 📱 **响应式** - 完美适配移动端和桌面端
- 🛠️ **后台管理** - 完整的分类和链接管理
- 📊 **访问统计** - 链接点击数据分析
- 🖼️ **画廊展示** - 支持图片展示功能
- 🌓 **深色模式** - 自动/手动切换
- 🔒 **安全加固** - 生产环境安全配置

## 🎯 适用场景

- 个人书签管理
- 团队资源共享
- 设计师工具导航
- 创意资源汇总

---

## 🏗️ 项目结构

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
├── docs/             # 文档（本站点）
├── DEPLOY.md         # 部署文档
├── SECURITY.md       # 安全指南
└── deploy.sh         # 一键部署脚本
```

---

## 🔧 技术栈

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

---

## 🛡️ 安全特性

- ✅ Docker 容器隔离
- ✅ 非 root 用户运行
- ✅ 安全响应头（X-Frame-Options, CSP 等）
- ✅ Fail2ban 防暴力破解
- ✅ 自动封禁恶意 IP
- ✅ 定期安全更新

---

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ychech/YC-Navigation)
- [问题反馈](https://github.com/ychech/YC-Navigation/issues)
- [快速开始](./getting-started)
