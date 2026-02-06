# 阿里云 ECS 2C2G 部署指南

本指南帮助你将 `Artistic Nav` 项目部署到 **2核2G** 配置的阿里云 ECS Ubuntu 22.04 服务器上。

---

## 📋 部署方案选择

| 方案 | 数据库 | 内存占用 | 适用场景 |
|------|--------|----------|----------|
| **方案一** | SQLite（本地） | ~150MB | 个人使用、快速部署 |
| **方案二** | MySQL（远程） | ~200MB | 需要远程备份、多应用共享数据库 |
| **方案三** | MySQL（本地） | ~700MB | ❌ 不推荐 2C2G 使用 |

> 💡 **推荐**：2C2G 服务器优先使用 **方案一（SQLite）** 或 **方案二（远程 MySQL）**

---

## 前置准备（所有方案都需要）

### 1. 安装基础软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y git nginx

# 验证安装
git --version
nginx -v
```

### 2. 开启 Swap（2G 内存必需！）

Next.js 构建时会占用大量内存，2G 物理内存不够，必须开启虚拟内存：

```bash
# 创建 4G Swap 文件
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 设置开机自启
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 验证（看 Swap 是否有 4096）
free -h
```

---

## 方案一：Docker + SQLite（推荐，最简单）

SQLite 是单文件数据库，零配置、免维护，适合个人导航站。

### 1. 安装 Docker

```bash
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 拉取代码并配置

```bash
cd /opt
sudo git clone https://github.com/your-username/artistic-nav.git
cd artistic-nav

# 创建环境配置文件
sudo tee .env > /dev/null << 'EOF'
# 管理员密码（务必修改！）
ADMIN_PASSWORD=your_secure_password_here

# 存储方式：local 或 oss
STORAGE_TYPE=local

# OSS 配置（仅当 STORAGE_TYPE=oss 时填写）
# OSS_REGION=oss-cn-hangzhou
# OSS_ACCESS_KEY_ID=your-key
# OSS_ACCESS_KEY_SECRET=your-secret
# OSS_BUCKET=your-bucket
# OSS_DOMAIN=https://your-domain.com
EOF
```

### 3. 部署启动

```bash
sudo ./deploy.sh
```

部署完成后访问：`http://你的服务器IP:3000`

---

## 方案二：Docker + 远程 MySQL

如果你的 MySQL 部署在另一台服务器、阿里云 RDS 或其他数据库服务上，使用此方案。

### 1. 安装 Docker

```bash
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 切换到 MySQL 模式

```bash
cd /opt
sudo git clone https://github.com/your-username/artistic-nav.git
cd artistic-nav

# 切换到 MySQL Schema
sudo ./scripts/switch-db.sh mysql
```

### 3. 配置环境变量

```bash
# 创建环境配置文件（填入你的远程 MySQL 信息）
sudo tee .env > /dev/null << 'EOF'
# 远程 MySQL 连接串
# 格式：mysql://用户名:密码@主机地址:端口/数据库名
DATABASE_URL="mysql://artistic_nav:your_password@your-mysql-server.com:3306/artistic_nav"

# 管理员密码（务必修改！）
ADMIN_PASSWORD=your_secure_password_here

# 存储方式
STORAGE_TYPE=local
EOF
```

> 🔐 **安全提示**：
> - 建议使用专用数据库用户，最小权限原则
> - 确保 MySQL 服务器防火墙只允许应用服务器 IP 访问 3306 端口
> - 生产环境建议使用阿里云内网连接 RDS

### 4. 部署启动

```bash
# 构建并启动
sudo ./deploy.sh
```

### 5. 阿里云 RDS 特别配置

如果使用阿里云 RDS MySQL：

```bash
# 连接串示例（使用内网地址，免费且更快）
DATABASE_URL="mysql://username:password@rm-xxx.mysql.rds.aliyuncs.com:3306/artistic_nav"
```

**RDS 安全组配置**：
1. 登录阿里云控制台 → RDS → 安全管理
2. 添加白名单，填入 ECS 服务器的 **内网 IP** 或安全组

---

## 方案三：手动部署 + 远程 MySQL（更省资源）

如果不使用 Docker，直接运行 Node.js 应用，资源占用最低。

### 1. 安装 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

### 2. 部署项目

```bash
cd /var/www
sudo git clone https://github.com/your-username/artistic-nav.git
cd artistic-nav
sudo npm install

# 切换到 MySQL 模式
sudo ./scripts/switch-db.sh mysql

# 配置环境变量
sudo tee .env > /dev/null << 'EOF'
DATABASE_URL="mysql://username:password@your-mysql-server:3306/artistic_nav"
ADMIN_PASSWORD=your_secure_password_here
STORAGE_TYPE=local
EOF

# 生成 Prisma Client
sudo npx prisma generate

# 推送数据库结构到远程 MySQL
sudo npx prisma db push

# 可选：导入初始数据
sudo npx tsx prisma/seed.ts

# 构建
sudo npm run build
```

### 3. 使用 PM2 启动

```bash
sudo pm2 start npm --name "artistic-nav" -- start
sudo pm2 save
sudo pm2 startup systemd
```

---

## 配置 Nginx 反向代理

无论哪种方案，都建议通过 Nginx 暴露服务：

```bash
# 创建配置
sudo tee /etc/nginx/sites-available/artistic-nav > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用配置
sudo ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 配置 HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 数据库管理

### SQLite 备份（方案一）

```bash
cd /opt/artistic-nav
sudo cp prisma/dev.db backups/dev.db.$(date +%Y%m%d)

# 自动备份（添加到 crontab）
sudo crontab -e
# 每天凌晨 2 点备份
0 2 * * * cp /opt/artistic-nav/prisma/dev.db /opt/artistic-nav/backups/dev.db.$(date +\%Y\%m\%d)
```

### 远程 MySQL 备份（方案二/三）

远程 MySQL 的备份在数据库服务器上进行：

```bash
# 在 MySQL 服务器上执行
mysqldump -u username -p artistic_nav > backup_$(date +%Y%m%d).sql
```

或使用阿里云 RDS 的自动备份功能。

---

## 切换数据库模式

部署后如需切换数据库：

```bash
# SQLite → 远程 MySQL
./scripts/switch-db.sh mysql
vim .env  # 修改 DATABASE_URL 为远程 MySQL
npx prisma generate
npx prisma db push
npm run build
pm2 restart artistic-nav  # 或 docker-compose restart
```

⚠️ **注意**：切换数据库后，原数据不会自动迁移，需要手动导出导入。

---

## 常见问题

### Q: 连接远程 MySQL 报错 `Can't connect to MySQL server`？

**排查步骤**：
1. 检查 MySQL 服务器防火墙是否开放 3306 端口
2. 检查 MySQL 用户是否有远程访问权限（`%` 或指定 IP）
3. 阿里云安全组是否放行
4. 测试连接：`mysql -h your-mysql-host -u username -p`

### Q: 构建时卡住或报错 Killed？

**A**: Swap 没开或开太小，按上面步骤开 4G Swap。

### Q: 上传图片失败？

**A**: 
- Local 模式：`chmod -R 777 public/uploads`
- OSS 模式：检查 AccessKey 权限和 Bucket CORS 设置

### Q: 如何更新代码？

```bash
cd /opt/artistic-nav
git pull
npm install
npx prisma db push  # 如有 schema 变更
npm run build

# Docker 方式
docker-compose down
docker-compose up -d --build
```

### Q: 502 Bad Gateway？

```bash
# Docker 方式
docker ps
docker logs artistic-nav

# 手动方式
pm2 list
pm2 logs artistic-nav
```

---

## 资源监控

```bash
# 内存使用
free -h

# 磁盘使用
df -h

# Docker 资源
docker stats

# PM2 监控
pm2 monit
```
