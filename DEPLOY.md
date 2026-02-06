# 艺术导航 - 阿里云 ECS 部署指南

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **公网IP**: 39.102.80.128  
> **GitHub**: https://github.com/ychech/YC-Navigation.git

---

## ⚠️ 为什么不用 Docker

在阿里云 ECS (特别是轻量应用服务器/入门级配置) 上使用 Docker 会遇到以下问题：

| 问题 | 原因 |
|------|------|
| **拉取镜像超时** | 访问 Docker Hub 网络不稳定，经常 `context deadline exceeded` |
| **国内镜像失效** | 阿里云/中科大镜像需要绑定阿里云账号，且经常 404 |
| **内存不足** | Docker 守护进程 + 镜像 + 容器，2G 内存很容易耗尽 |
| **构建失败** | `npm ci` 在容器内运行慢，容易卡死 |

**结论**: 2C2G 配置直接用 Node.js 部署更稳定、更快。

---

## 🚀 部署步骤

### 1. 连接服务器

```bash
ssh -i "你的密钥.pem" root@39.102.80.128
```

### 2. 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 3. 克隆代码

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav
```

### 4. 安装依赖

```bash
# 只安装生产依赖（更快，占用更少内存）
npm ci
```

### 5. 配置环境

```bash
# 创建 .env 文件
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

### 6. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库（如果不存在会自动创建）
npx prisma db push --accept-data-loss

# 导入初始数据（分类、链接、配置等）
npx prisma db seed
```

### 7. 构建应用

```bash
npm run build
```

### 8. 安装 PM2 并启动

```bash
# 安装 PM2 进程管理器
npm install -g pm2

# 启动应用
pm2 start npm --name "artistic-nav" -- run start

# 设置开机自启
pm2 startup
pm2 save
```

### 9. 配置 Nginx 反向代理

```bash
# 安装 Nginx
apt-get update
apt-get install -y nginx

# 创建 Nginx 配置
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重载
nginx -t && systemctl reload nginx
```

### 10. 完成

```bash
echo "✅ 部署完成!"
echo "前台: http://39.102.80.128"
echo "后台: http://39.102.80.128/admin"
echo "账号: admin"
echo "密码: admin123456"
```

---

## 🔧 管理命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart artistic-nav

# 停止
pm2 stop artistic-nav

# 更新代码（有代码更新时执行）
cd /opt/artistic-nav
git pull
npm ci
npm run build
pm2 restart artistic-nav
```

---

## 🐛 常见问题

### 1. 白屏 / 500 错误

通常是数据库问题：

```bash
cd /opt/artistic-nav

# 检查数据库是否存在
ls -la prisma/dev.db

# 如果不存在或损坏，重新初始化
npx prisma db push --accept-data-loss
npx prisma db seed

# 重启
pm2 restart artistic-nav
```

### 2. 端口被占用

```bash
# 查看占用 3000 的进程
lsof -i :3000

# 结束进程
kill $(lsof -t -i:3000)

# 重启
pm2 restart artistic-nav
```

### 3. 内存不足（2G 服务器常见问题）

添加 Swap 虚拟内存：

```bash
# 创建 2G Swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 查看
free -h
```

### 4. npm install 卡死

如果 `npm ci` 卡住，改用：

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm ci

# 或者用 yarn
npm install -g yarn
yarn install --frozen-lockfile
```

### 5. 无法访问（防火墙）

```bash
# 检查防火墙
ufw status

# 放行 80 端口
ufw allow 80/tcp

# 或者关闭防火墙（测试环境）
ufw disable
```

---

## 📁 重要文件位置

| 文件/目录 | 说明 | 备份建议 |
|----------|------|---------|
| `/opt/artistic-nav/prisma/dev.db` | SQLite 数据库 | ⭐⭐⭐ 必须备份 |
| `/opt/artistic-nav/public/uploads` | 上传的图片文件 | ⭐⭐⭐ 必须备份 |
| `/opt/artistic-nav/.env` | 环境配置 | ⭐⭐ 建议备份 |
| `/root/.pm2/logs/` | 应用日志 | ⭐ 可选 |

---

## 🔒 安全建议

1. **立即修改默认密码**
   - 访问 http://39.102.80.128/admin
   - 账号: `admin`
   - 密码: `admin123456`
   - 登录后在"系统核心"修改密码

2. **配置防火墙**
   ```bash
   ufw default deny incoming
   ufw allow 22/tcp    # SSH
   ufw allow 80/tcp    # HTTP
   ufw allow 443/tcp   # HTTPS (如果配置了 SSL)
   ufw enable
   ```

3. **定期备份**
   ```bash
   # 手动备份
   tar -czf backup-$(date +%Y%m%d).tar.gz \
       /opt/artistic-nav/prisma/dev.db \
       /opt/artistic-nav/public/uploads
   
   # 下载到本地
   scp -i "你的密钥.pem" root@39.102.80.128:/opt/artistic-nav/backup-*.tar.gz ./
   ```

---

## 📊 性能优化

对于 2C2G 服务器：

1. **使用 SQLite** 而非 MySQL（节省 ~500MB 内存）
2. **启用 Swap**（防止内存不足）
3. **定期清理日志**
   ```bash
   pm2 flush          # 清空 PM2 日志
   > /var/log/nginx/access.log  # 清空 Nginx 访问日志
   ```

---

## 📞 需要帮助？

1. 查看日志: `pm2 logs`
2. 检查 Nginx: `nginx -t`
3. 测试本地: `curl http://localhost:3000`
4. 检查数据库: `ls -la prisma/dev.db`
