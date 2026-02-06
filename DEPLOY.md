# 艺术导航 - 阿里云 ECS 部署指南

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **公网IP**: 39.102.80.128  
> **GitHub**: https://github.com/ychech/YC-Navigation.git

---

## 🚀 快速部署

### 1. SSH 登录服务器

```bash
ssh -i "你的密钥路径" root@39.102.80.128
```

### 2. 一键部署脚本

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav

# 安装依赖
npm ci

# 生成 Prisma Client
npx prisma generate

# 创建环境配置
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

# 初始化数据库
npx prisma db push --accept-data-loss
npx prisma db seed

# 构建
npm run build

# 安装 PM2
npm install -g pm2

# 启动
pm2 start npm --name "artistic-nav" -- run start

# 配置 Nginx
apt-get update && apt-get install -y nginx

cat > /etc/nginx/sites-available/artistic-nav << 'NGINX'
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
NGINX

ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "✅ 部署完成!"
echo "前台: http://39.102.80.128"
echo "后台: http://39.102.80.128/admin"
echo "账号: admin / admin123456"
```

---

## 📁 目录结构

```
/opt/artistic-nav/
├── prisma/
│   ├── dev.db          # SQLite 数据库
│   ├── schema.prisma   # 数据库模型
│   └── seed.ts         # 初始数据
├── public/uploads/     # 上传文件
├── .env                # 环境变量
└── ...                 # 源代码
```

---

## 🔧 管理命令

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

### 1. 数据库错误

```bash
# 重新初始化数据库
cd /opt/artistic-nav
npx prisma db push --accept-data-loss
npx prisma db seed
```

### 2. 端口被占用

```bash
# 查看占用 3000 端口的进程
lsof -i :3000

# 结束进程
kill $(lsof -t -i:3000)
```

### 3. 权限错误

```bash
chmod -R 755 /opt/artistic-nav
chmod 644 /opt/artistic-nav/prisma/dev.db
```

---

## 🔒 安全建议

1. **修改默认密码**: 登录后台后立即修改 `admin123456`
2. **配置防火墙**: 只开放 22, 80, 443 端口
3. **定期备份**: 备份 `prisma/dev.db` 和 `public/uploads`

---

## 📞 支持

遇到问题?

1. 查看日志: `pm2 logs`
2. 检查 Nginx: `nginx -t`
3. 测试本地: `curl http://localhost:3000`
