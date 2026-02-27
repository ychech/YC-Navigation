# 快速开始（3 分钟部署）

本文档帮助你在 3 分钟内完成 Artistic Nav 的部署。

## 一键部署（推荐）

### Docker 方式

```bash
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

### PM2 方式

```bash
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s nodejs
```

---

## 手动部署步骤

### 1. 服务器准备

```bash
# 安装 Docker 和 Nginx
apt-get update
apt-get install -y docker.io nginx sqlite3
```

### 2. 上传代码

```bash
# 在本地执行
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
  ./ root@your-server-ip:/opt/artistic-nav/
```

### 3. 一键部署

```bash
# 在服务器执行
cd /opt/artistic-nav
./scripts/deploy.sh
```

---

## 部署完成后

### 访问地址

| 端点 | 地址 | 说明 |
|------|------|------|
| 前台 | `http://your-server-ip` | 导航首页 |
| 后台 | `http://your-server-ip/admin` | 管理系统 |

### 默认登录信息

- **用户名**: `admin`
- **密码**: `WOijjIZ73jrwZqL`（可在 `.env` 中修改）

::: warning 安全提醒
首次登录后请立即修改默认密码！
:::

---

## 目录结构

部署后的服务器目录结构：

```
/opt/artistic-nav/
├── data/
│   ├── prisma/          # SQLite 数据库
│   │   └── dev.db
│   └── uploads/         # 上传的文件
├── scripts/
│   ├── deploy.sh        # 部署脚本
│   └── init.sql         # 数据库初始化
├── Dockerfile           # Docker 构建
└── DEPLOY.md           # 部署文档
```

---

## 下一步

- [Docker 详细部署](./docker.md)
- [PM2 部署](./pm2.md)
- [Vercel 部署](./vercel.md)
- [安全加固](./security.md)
