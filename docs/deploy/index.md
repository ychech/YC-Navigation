# 部署概述

Artistic Nav 支持多种部署方式，适应不同场景需求。

## 🚀 快速开始

最快 3 分钟完成部署：

::: code-group

```bash [Docker 一键部署]
# 下载并运行部署脚本
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | bash

# 或使用本地脚本
./deploy.sh
```

```bash [手动 Docker]
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation
docker-compose up -d
```

:::

---

## 部署要求

### 最低配置

- **CPU**: 1 核
- **内存**: 512MB
- **存储**: 1GB
- **系统**: Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)

### 推荐配置

- **CPU**: 2 核
- **内存**: 1GB
- **存储**: 5GB

---

## 数据库支持

Artistic Nav 支持两种数据库：

| 数据库 | 适用场景 | 配置方式 |
|--------|---------|---------|
| **SQLite** (默认) | 个人使用、小型站点 | 无需配置，开箱即用 |
| **MySQL** | 团队使用、大型站点 | 需配置环境变量 |

### SQLite 配置（默认）

```env
DATABASE_URL=file:/app/prisma/dev.db
DB_PROVIDER=sqlite
```

### MySQL 配置

```env
DATABASE_URL=mysql://user:password@localhost:3306/artistic_nav
DB_PROVIDER=mysql
```

使用 MySQL 时需要先创建数据库：

```sql
CREATE DATABASE artistic_nav CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 部署方式对比

| 方式 | 复杂度 | 适用场景 | 维护难度 |
|------|--------|---------|---------|
| **Docker Compose** | ⭐ 简单 | 生产环境推荐 | 低 |
| **Docker 单机** | ⭐⭐ 中等 | 快速测试 | 中 |
| **PM2 直接部署** | ⭐⭐⭐ 复杂 | 开发环境 | 高 |
| **Vercel** | ⭐ 简单 | 无服务器部署 | 极低 |

---

## 环境变量配置

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=file:/app/prisma/dev.db
DB_PROVIDER=sqlite

# 管理员密码（必须修改）
ADMIN_PASSWORD=your-secure-password

# NextAuth 密钥（自动生成）
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost

# 存储类型
STORAGE_TYPE=local
```

---

## 📖 部署文档

- [快速开始](./quick-start) - 3 分钟完成部署
- [Docker 部署](./docker.md) - 详细的 Docker 部署指南
- [MySQL 配置](./mysql.md) - 使用 MySQL 数据库
- [Vercel 部署](./vercel.md) - 无服务器部署
- [安全加固](./security.md) - 生产环境安全加固

---

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ychech/YC-Navigation)
- [问题反馈](https://github.com/ychech/YC-Navigation/issues)
