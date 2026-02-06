# 艺术导航 - 阿里云 ECS 部署文档

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **公网IP**: 39.102.80.128  
> **GitHub**: https://github.com/ychech/YC-Navigation.git

---

## ⚠️ 重要提示

**不要**使用 Docker 部署！阿里云 2C2G 服务器无法稳定拉取 Docker 镜像（网络超时）。

**推荐**使用 Node.js + PM2 直接部署。

---

## 🚀 部署步骤

### 1. SSH 登录服务器

```bash
ssh -i "你的密钥.pem" root@39.102.80.128
```

### 2. 安装 Node.js 20

```bash
# 使用阿里云镜像安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 验证
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 3. 克隆代码

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav
```

### 4. 安装依赖

```bash
npm ci
```

### 5. 配置环境变量

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

### 6. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库
npx prisma db push --accept-data-loss

# 导入初始数据
npx prisma db seed
```

### 7. 构建应用

```bash
npm run build
```

### 8. 安装 PM2 并启动

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "artistic-nav" -- run start

# 设置开机自启
pm2 startup
pm2 save
```

### 9. 配置 Nginx

```bash
# 安装 Nginx
apt-get install -y nginx

# 创建配置
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

# 启用配置
ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重载
nginx -t && systemctl reload nginx
```

### 10. 完成

访问:
- 前台: http://39.102.80.128
- 后台: http://39.102.80.128/admin
- 账号: `admin` / `admin123456`

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

## 🐛 故障排查

### 问题 1: 数据库错误

现象: `Error querying the database: Error code 14`

解决:
```bash
cd /opt/artistic-nav
npx prisma db push --accept-data-loss
npx prisma db seed
```

### 问题 2: 白屏/数据为空

现象: 页面加载但无内容

解决:
```bash
# 检查数据库
cd /opt/artistic-nav
node -e "const {PrismaClient}=require('@prisma/client');new PrismaClient().category.findMany().then(c=>console.log('Categories:', c.length))"

# 如果为 0，重新导入数据
npx prisma db seed
```

### 问题 3: 端口被占用

```bash
# 查看占用
lsof -i :3000

# 结束进程
kill $(lsof -t -i:3000)

# 重启
pm2 restart artistic-nav
```

### 问题 4: 内存不足

2C2G 服务器可能内存不足，添加 Swap:

```bash
# 创建 2G Swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 📁 文件说明

| 文件/目录 | 说明 |
|----------|------|
| `/opt/artistic-nav` | 应用代码 |
| `/opt/artistic-nav/prisma/dev.db` | SQLite 数据库 |
| `/opt/artistic-nav/public/uploads` | 上传的文件 |
| `/root/.pm2/logs` | 应用日志 |
| `/var/log/nginx` | Nginx 日志 |

---

## 🔒 安全配置

1. **修改默认密码**
   - 登录 http://39.102.80.128/admin
   - 账号: `admin`
   - 密码: `admin123456`
   - 首次登录后立即修改

2. **配置防火墙**
   ```bash
   ufw default deny incoming
   ufw allow 22/tcp   # SSH
   ufw allow 80/tcp   # HTTP
   ufw allow 443/tcp  # HTTPS
   ufw enable
   ```

3. **定期备份**
   ```bash
   # 备份脚本
   tar -czf backup-$(date +%Y%m%d).tar.gz /opt/artistic-nav/prisma/dev.db /opt/artistic-nav/public/uploads
   ```

---

## 📝 更新记录

- 2025-02-06: 初始部署文档
- 移除 Docker 部署（网络不稳定）
- 使用 Node.js + PM2 直接部署
