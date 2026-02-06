# 部署指南

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **公网IP**: 39.102.80.128

---

## 📋 方案对比

| 方案 | 内存占用 | 适用场景 | 难度 |
|------|---------|---------|------|
| **Node.js + PM2** | ~150MB | 2C2G 服务器，推荐 ✅ | ⭐ |
| **Docker + SQLite** | ~400MB | 4G+ 内存服务器 | ⭐⭐ |
| **Docker + MySQL** | ~900MB | 高并发，多实例 | ⭐⭐⭐ |

> 💡 **2C2G 服务器强烈推荐 Node.js + PM2 方案**

---

## 方案一：Node.js + PM2（推荐）

### 1. 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 2. 克隆代码

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav
```

### 3. 安装依赖

```bash
npm ci
```

### 4. 配置环境

```bash
cat > .env << 'EOF'
DB_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://39.102.80.128
ADMIN_PASSWORD=admin123456
STORAGE_TYPE=local
UPLOAD_DIR=./public/uploads
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF
```

### 5. 初始化数据库

```bash
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma db seed
```

### 6. 构建

```bash
npm run build
```

### 7. 安装 PM2 并启动

```bash
npm install -g pm2
pm2 start npm --name "artistic-nav" -- run start
pm2 startup
pm2 save
```

### 8. 配置 Nginx

```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/artistic-nav << 'EOF'
server {
    listen 80;
    server_name 39.102.80.128;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 9. 完成

- 前台: http://39.102.80.128
- 后台: http://39.102.80.128/admin
- 账号: `admin` / `admin123456`

---

## 方案二：Docker 部署

> ⚠️ 需要 4G+ 内存，2C2G 服务器不推荐

详见 [deploy/README.md](./deploy/README.md)

---

## 🔧 运维命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart artistic-nav

# 停止
pm2 stop artistic-nav

# 更新代码
cd /opt/artistic-nav
git pull
npm ci
npm run build
pm2 restart artistic-nav
```

---

## 🐛 常见问题

### 1. 内存不足 (2C2G 常见问题)

```bash
# 添加 4G Swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 2. 数据库错误

```bash
cd /opt/artistic-nav
npx prisma db push --accept-data-loss
npx prisma db seed
pm2 restart artistic-nav
```

### 3. 端口被占用

```bash
lsof -i :3000
kill $(lsof -t -i:3000)
pm2 restart artistic-nav
```

### 4. npm install 卡住

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm ci
```

---

## 🔒 安全建议

1. **立即修改默认密码**: 登录后台 → 系统核心 → 修改密码
2. **配置防火墙**:
   ```bash
   ufw default deny incoming
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```
3. **定期备份**:
   ```bash
   tar -czf backup-$(date +%Y%m%d).tar.gz \
       /opt/artistic-nav/prisma/dev.db \
       /opt/artistic-nav/public/uploads
   ```
