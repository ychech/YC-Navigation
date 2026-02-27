# 部署概述

Artistic Nav 支持多种部署方式，从快速一键部署到生产环境安全加固。

## 🚀 快速开始

最快 3 分钟完成部署：

::: code-group

```bash [Docker 一键部署]
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

```bash [PM2 一键部署]
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s nodejs
```

:::

[查看详细快速部署指南 →](./quick-start)

---

## 部署方式对比

| 方式 | 适用场景 | 复杂度 | 速度 |
|------|---------|--------|------|
| **Docker 本地构建** | 服务器网络慢 | 中 | ⭐⭐⭐ |
| **Docker 服务器构建** | 服务器网络好 | 低 | ⭐⭐ |
| **PM2 直接部署** | 快速测试、低配置 | 低 | ⭐⭐⭐ |
| **Vercel** | 无服务器部署 | 低 | ⭐⭐⭐ |

---

## 📋 部署要求

### 最低配置

- 1 CPU
- 512MB RAM
- 1GB 存储

### 推荐配置

- 2 CPU
- 1GB RAM
- 5GB 存储

### 系统要求

- Ubuntu 20.04+
- CentOS 8+
- Debian 11+

---

## 部署前准备

1. 确保已安装 Docker 或 Node.js
2. 配置好环境变量
3. 开放必要的端口（默认 3000）

---

## 📖 部署文档

- [快速开始](./quick-start) - 3 分钟完成部署
- [Docker 部署](./docker.md) - 详细的 Docker 部署指南
- [PM2 部署](./pm2.md) - 使用 PM2 部署
- [Vercel 部署](./vercel.md) - 无服务器部署
- [安全加固](./security.md) - 生产环境安全加固

---

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ychech/YC-Navigation)
- [问题反馈](https://github.com/ychech/YC-Navigation/issues)
- [Docker Hub](https://hub.docker.com/r/ychech/artistic-nav)
