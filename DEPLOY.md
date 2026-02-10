# 部署指南

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **推荐部署**: Node.js + PM2（内存占用 ~150MB）

---

## 方案对比

| 方案 | 内存占用 | 适用场景 | 推荐度 |
|------|---------|---------|--------|
| **Node.js + PM2** | ~150MB | 2C2G 服务器 | ⭐⭐⭐ |
| **Docker** | ~400MB | 4G+ 内存服务器 | ⭐⭐ |

---

## 🚀 一键部署（推荐）

### Node.js + PM2（2C2G 服务器）

```bash
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash
```

或

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh)"
```

### Docker（4G+ 内存服务器）

```bash
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

---

## 手动部署

### 方案一：Node.js + PM2（推荐）

#### 1. 服务器准备

```bash
# 系统更新
apt-get update && apt-get upgrade -y

# 添加 Swap（2G内存必需）
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

#### 2. 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x
```

#### 3. 克隆代码

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav
```

#### 4. 安装依赖

```bash
npm ci --omit=dev
```

#### 5. 配置环境变量

```bash
cat > .env << 'EOF'
# 数据库（SQLite，零配置）
DB_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db

# 安全密钥（必须修改！）
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://YOUR_SERVER_IP

# 管理员密码（必须修改！）
ADMIN_PASSWORD=your_secure_password

# 存储配置
STORAGE_TYPE=local
UPLOAD_DIR=./public/uploads

# 禁用遥测
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF
```

#### 6. 初始化数据库

```bash
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma db seed
```

#### 7. 构建应用

```bash
npm run build
```

#### 8. 安装 PM2 并启动

```bash
npm install -g pm2
pm2 start npm --name "artistic-nav" -- run start
pm2 startup
pm2 save
```

#### 9. 配置 Nginx

```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/artistic-nav << 'EOF'
server {
    listen 80;
    server_name _;
    
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

---

### 方案二：Docker 部署

> ⚠️ 需要 4G+ 内存，详见 [deploy/README.md](./deploy/README.md)

```bash
# 一键部署
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

或手动部署：

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav
sudo bash deploy.sh docker
```

---

## 阿里云 OSS 配置（可选）

### 1. 创建 OSS Bucket

- 登录阿里云控制台 → 对象存储 OSS
- 创建 Bucket（建议：标准存储、私有读写）
- 记录 Endpoint（如 `oss-cn-beijing.aliyuncs.com`）

### 2. 获取访问密钥

- 右上角头像 → AccessKey 管理
- 创建 AccessKey，记录 `AccessKey ID` 和 `AccessKey Secret`

### 3. 配置环境变量

```bash
cat >> /opt/artistic-nav/.env << 'EOF'

# OSS 配置
STORAGE_TYPE=oss
OSS_REGION=oss-cn-beijing
OSS_BUCKET=your-bucket-name
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
EOF

# 重启应用
pm2 restart artistic-nav
# 或 Docker: cd /opt/artistic-nav/deploy && docker-compose restart artistic-nav
```

---

## HTTPS 配置（推荐）

```bash
# 安装 certbot
apt-get install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
certbot --nginx -d your-domain.com --non-interactive --agree-tos -m your-email@example.com

# 自动续期测试
certbot renew --dry-run
```

---

## 运维命令

```bash
# 查看状态
pm2 status
pm2 logs

# 重启/停止
pm2 restart artistic-nav
pm2 stop artistic-nav

# 更新代码
cd /opt/artistic-nav
git pull
npm ci --omit=dev
npm run build
pm2 restart artistic-nav

# 备份数据
tar -czf backup-$(date +%Y%m%d).tar.gz prisma/dev.db public/uploads
```

---

## 安全加固

### 1. 配置防火墙

```bash
ufw default deny incoming
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. 修改默认密码

部署完成后立即登录后台修改管理员密码。

### 3. 定期备份

```bash
crontab -e
# 添加：每天凌晨3点备份
0 3 * * * cd /opt/artistic-nav && tar -czf /backup/artistic-nav-$(date +\%Y\%m\%d).tar.gz prisma/dev.db public/uploads
```

---

## 常见问题

### 1. 构建时内存不足

```bash
# 增加 Node 内存限制
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

### 2. 端口被占用

```bash
lsof -i :3000
kill $(lsof -t -i:3000)
pm2 restart artistic-nav
```

### 3. 数据库错误

```bash
cd /opt/artistic-nav
npx prisma db push --accept-data-loss
npx prisma db seed
pm2 restart artistic-nav
```

---

## 访问地址

- **前台**: http://YOUR_SERVER_IP
- **后台**: http://YOUR_SERVER_IP/admin
- **默认账号**: `admin` / 你设置的密码
