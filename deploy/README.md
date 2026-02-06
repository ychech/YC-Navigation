# Docker 部署指南

> ⚠️ **前提条件**: 需要 4G+ 内存，2C2G 服务器请使用 Node.js + PM2 方案

---

## 为什么 2C2G 不适合 Docker

| 问题 | 原因 |
|------|------|
| 拉取镜像超时 | Docker Hub 网络不稳定 |
| 内存不足 | Docker + 构建需要 ~2G+ 内存 |
| 构建卡死 | npm install 在容器内容易 OOM |

---

## 前置要求

- 内存: 4G+ RAM
- 磁盘: 20G+ 可用空间
- Docker 20.10+
- Docker Compose 2.0+

---

## 部署步骤

### 1. 安装 Docker

```bash
apt-get update
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

### 2. 配置镜像加速（国内服务器）

```bash
mkdir -p /etc/docker

cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://你的ID.mirror.aliyuncs.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

systemctl restart docker
```

### 3. 准备代码

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav

# 创建环境配置
cat > .env << 'EOF'
DB_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://your-domain.com
ADMIN_PASSWORD=admin123456
STORAGE_TYPE=local
UPLOAD_DIR=./public/uploads
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF

mkdir -p prisma public/uploads logs
```

### 4. 构建并启动

```bash
cd deploy
docker-compose build
docker-compose up -d

# 初始化数据库
docker-compose exec nextjs npx prisma db push
docker-compose exec nextjs npx prisma db seed
```

### 5. 配置 Nginx

```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/artistic-nav << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 🔧 管理命令

```bash
cd /opt/artistic-nav/deploy

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f nextjs

# 重启
docker-compose restart nextjs

# 停止
docker-compose down

# 更新代码
cd /opt/artistic-nav
git pull
cd deploy
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 常见问题

### 拉取镜像超时

配置多个镜像源，或改用 Node.js 直接部署。

### 构建时内存不足

```bash
# 添加 Swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### 数据库权限错误

```bash
chmod -R 777 /opt/artistic-nav/prisma
chmod -R 777 /opt/artistic-nav/public/uploads
```

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `Dockerfile` | 多阶段构建配置 |
| `docker-compose.yml` | 容器编排配置 |
| `nginx/artistic-nav.conf` | Nginx 配置模板 |
