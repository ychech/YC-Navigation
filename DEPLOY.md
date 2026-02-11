# 部署指南

> 支持多种部署方式：Docker（推荐）、PM2、本地镜像导入

---

## 方案对比

| 方案 | 难度 | 速度 | 适用场景 | 推荐度 |
|------|------|------|---------|--------|
| **Docker 本地构建** | ⭐⭐ | 快 | 有 Docker 环境的开发机 | ⭐⭐⭐ |
| **Docker 服务器构建** | ⭐ | 慢 | 服务器网络好 | ⭐⭐ |
| **PM2 直接部署** | ⭐ | 快 | 快速测试、低配置服务器 | ⭐⭐ |
| **镜像导入** | ⭐⭐⭐ | 最快 | 多台服务器部署 | ⭐⭐⭐ |

---

## 方式一：Docker 本地构建 + 上传（推荐）

适合：本地有 Docker 环境，服务器网络慢

### 1. 本地构建镜像

```bash
# 克隆代码
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation

# 构建镜像（使用华为云加速）
docker build -f deploy/Dockerfile -t artistic-nav:latest .

# 导出镜像
docker save artistic-nav:latest > artistic-nav.tar

# 压缩（可选）
gzip artistic-nav.tar
```

### 2. 上传到服务器

```bash
# 上传到服务器
scp artistic-nav.tar.gz root@YOUR_SERVER_IP:/opt/

# SSH 登录服务器
ssh root@YOUR_SERVER_IP
```

### 3. 服务器运行

```bash
cd /opt

# 解压镜像
gunzip artistic-nav.tar.gz
docker load < artistic-nav.tar

# 创建目录
mkdir -p artistic-nav/prisma artistic-nav/public/uploads
cd artistic-nav

# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3'
services:
  artistic-nav:
    container_name: artistic-nav
    image: artistic-nav:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./prisma/dev.db
      - ADMIN_PASSWORD=your_secure_password
      - NEXTAUTH_SECRET=your_secret_key
      - NEXTAUTH_URL=http://YOUR_SERVER_IP
    volumes:
      - ./prisma/dev.db:/app/prisma/dev.db
      - ./public/uploads:/app/public/uploads
EOF

# 启动
docker-compose up -d

# 初始化数据库
docker-compose exec artistic-nav npx prisma db push
docker-compose exec artistic-nav npx prisma db seed
```

---

## 方式二：服务器直接 Docker 部署

适合：服务器网络好，想快速部署

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | bash -

# 2. 配置镜像加速（华为云）
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://swr.cn-north-4.myhuaweicloud.com"
  ]
}
EOF
systemctl restart docker

# 3. 克隆代码
git clone https://github.com/ychech/YC-Navigation.git /opt/artistic-nav
cd /opt/artistic-nav

# 4. 配置环境
cat > .env << 'EOF'
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://YOUR_SERVER_IP
EOF

# 5. 构建并启动
cd deploy
docker-compose up -d --build

# 6. 初始化数据库
docker-compose exec artistic-nav npx prisma db push
docker-compose exec artistic-nav npx prisma db seed
```

---

## 方式三：PM2 部署（资源占用最低）

适合：2C2G 低配服务器，快速测试

```bash
# 1. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. 克隆代码
git clone https://github.com/ychech/YC-Navigation.git /opt/artistic-nav
cd /opt/artistic-nav

# 3. 安装依赖
npm ci --omit=dev

# 4. 配置环境
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://YOUR_SERVER_IP
EOF

# 5. 初始化数据库
npx prisma generate
npx prisma db push
npx prisma db seed

# 6. 构建
npm run build

# 7. 安装 PM2 并启动
npm install -g pm2
pm2 start npm --name "artistic-nav" -- run start
pm2 startup
pm2 save

# 8. 安装 Nginx
apt-get install -y nginx

cat > /etc/nginx/sites-available/artistic-nav << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;
    
    location /uploads/ {
        alias /opt/artistic-nav/public/uploads/;
        expires 30d;
    }
    
    location /_next/static/ {
        alias /opt/artistic-nav/.next/static/;
        expires 365d;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 方式四：一键部署脚本

```bash
# 下载并执行一键部署脚本
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash

# Docker 方式
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker

# PM2 方式
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s nodejs
```

---

## 多服务器部署

如果你有多个服务器要部署：

```bash
#!/bin/bash

# 1. 本地构建镜像
docker build -f deploy/Dockerfile -t artistic-nav:latest .
docker save artistic-nav:latest > artistic-nav.tar

# 2. 部署到多台服务器
SERVERS=(
  "root@server1.com"
  "root@server2.com"
  "root@server3.com"
)

for server in "${SERVERS[@]}"; do
  echo "部署到 $server..."
  scp artistic-nav.tar $server:/tmp/
  ssh $server "
    docker load < /tmp/artistic-nav.tar
    docker stop artistic-nav 2>/dev/null || true
    docker rm artistic-nav 2>/dev/null || true
    docker run -d \
      --name artistic-nav \
      --restart always \
      -p 3000:3000 \
      -e ADMIN_PASSWORD=your_password \
      artistic-nav:latest
    rm /tmp/artistic-nav.tar
  "
done
```

---

## 配置 HTTPS

```bash
# 安装 certbot
apt-get install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 运维命令

### Docker 运维
```bash
cd /opt/artistic-nav/deploy
docker-compose ps          # 查看状态
docker-compose logs -f     # 查看日志
docker-compose restart     # 重启
docker-compose down        # 停止
docker-compose up -d       # 启动
```

### PM2 运维
```bash
pm2 status                 # 查看状态
pm2 logs                   # 查看日志
pm2 restart artistic-nav   # 重启
pm2 stop artistic-nav      # 停止
pm2 start artistic-nav     # 启动
```

---

## 安全建议

1. **修改默认密码**：部署后立即登录后台修改管理员密码
2. **配置防火墙**：只开放 80/443 端口
3. **定期备份**：备份数据库和上传的文件
4. **更新系统**：定期执行 `apt-get update && apt-get upgrade`

---

## 常见问题

### 1. Docker 构建慢
- 使用镜像加速（华为云/阿里云）
- 或者在本地构建后上传镜像

### 2. 内存不足（2C2G）
- 添加 4G Swap
- 使用 PM2 部署（内存占用更低）

### 3. 图片不显示
- 检查 Nginx 配置中 `/uploads/` 路径
- 检查文件夹权限

### 4. 数据库错误
```bash
# 重新初始化
npx prisma db push --accept-data-loss
npx prisma db seed
```
