# 快速开始

## 环境要求

- Node.js 18+
- SQLite (默认) 或 MySQL 8.0+
- Docker (可选)

## 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置数据库和管理员密码：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 管理员密码
ADMIN_PASSWORD=your_secure_password
```

### 4. 初始化数据库

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

后台管理：http://localhost:3000/admin

默认账号：`admin` / `admin123456`

::: warning 安全提醒
首次登录后请立即修改默认密码！
:::

---

## 🐳 Docker 运行

```bash
cd deploy
docker-compose up -d
```

---

## 四种部署方式

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

---

## 📖 下一步

- 了解 [环境配置](./configuration.md)
- 学习 [导航管理](./navigation.md)
- 查看 [部署指南](../deploy/quick-start.md)
