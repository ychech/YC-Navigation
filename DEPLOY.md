# 部署指南 (Deployment Guide)

本指南包含本地开发部署和阿里云生产环境部署的详细步骤。

## 1. 环境要求 (Prerequisites)

- **Node.js**: v18.17.0 或更高版本
- **包管理器**: npm (推荐) 或 yarn/pnpm
- **数据库**: MySQL 8.0+ 或 PostgreSQL
- **Git**: 版本控制工具

---

## 2. 本地部署 (Local Deployment)

### 2.1 克隆项目
```bash
git clone <your-repo-url>
cd artistic-nav
```

### 2.2 安装依赖
```bash
npm install
```

### 2.3 配置环境变量
复制 `.env` 文件模板：
```bash
cp .env.example .env
# 或者直接创建 .env 文件
```

在 `.env` 文件中填入数据库连接信息：
```env
# 示例：MySQL 连接串
DATABASE_URL="mysql://root:password@localhost:3306/artistic_nav"
```

### 2.4 初始化数据库
```bash
# 生成 Prisma Client
npx prisma generate

# 推送数据库结构
npx prisma db push

# (可选) 填充初始数据
npx prisma db seed
```

### 2.5 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

---

## 3. 阿里云部署 (Alibaba Cloud Deployment)

本方案采用 **ECS (Ubuntu/CentOS) + Nginx + PM2** 的架构。

### 3.1 准备工作
1.  购买阿里云 ECS 实例（推荐 Ubuntu 22.04 LTS）。
2.  配置安全组规则，开放端口：
    *   `80` (HTTP)
    *   `443` (HTTPS)
    *   `22` (SSH)
    *   `3000` (Next.js 默认端口，仅用于测试，生产环境通过 Nginx 转发)

### 3.2 服务器环境配置 (在 ECS 上执行)

#### 安装 Node.js
```bash
# 安装 NodeSource 仓库 (Node.js 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

#### 安装 Nginx
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

#### 安装 PM2 (进程管理)
```bash
sudo npm install -g pm2
```

### 3.3 部署项目

#### 拉取代码
```bash
cd /var/www
sudo git clone <your-repo-url> artistic-nav
cd artistic-nav
```

#### 安装依赖与构建
```bash
# 安装依赖
npm install

# 配置环境变量 (生产环境)
vim .env
# 粘贴你的 DATABASE_URL

# 初始化数据库
npx prisma generate
npx prisma db push

# 构建项目
npm run build
```

#### 使用 PM2 启动
```bash
pm2 start npm --name "artistic-nav" -- start
pm2 save
pm2 startup
```

### 3.4 配置 Nginx 反向代理

编辑 Nginx 配置文件：
```bash
sudo vim /etc/nginx/sites-available/artistic-nav
```

写入以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com; # 替换为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置并重启 Nginx：
```bash
sudo ln -s /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.5 (可选) 配置 HTTPS (SSL 证书)
使用 Certbot 自动配置 Let's Encrypt 证书：
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 4. 常见问题 (Troubleshooting)

- **构建报错 (Heap Out of Memory)**: 尝试增加 Node 内存限制 `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
- **数据库连接失败**: 检查 ECS 安全组是否允许出入站连接，检查 `.env` 中的数据库地址是否正确。
- **502 Bad Gateway**: 检查 PM2 进程是否正常运行 (`pm2 list`)，检查 Next.js 端口是否为 3000。
