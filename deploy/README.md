# 艺术导航 - 阿里云 ECS 部署指南

> **服务器配置**: 阿里云 ECS 2核2G，Ubuntu 22.04 LTS  
> **公网IP**: 39.102.80.128  
> **GitHub**: https://github.com/ychech/YC-Navigation

---

## 📋 目录

1. [快速开始](#快速开始)
2. [手动部署](#手动部署)
3. [配置说明](#配置说明)
4. [数据库选择](#数据库选择)
5. [存储选择](#存储选择)
6. [SSL/HTTPS 配置](#sslhttps-配置)
7. [运维管理](#运维管理)
8. [故障排查](#故障排查)
9. [安全建议](#安全建议)
10. [升级更新](#升级更新)

---

## 🚀 快速开始

### 一键部署 (推荐)

```bash
# 1. 登录服务器
ssh root@39.102.80.128

# 2. 下载部署脚本
wget https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy/deploy.sh

# 3. 运行部署脚本
sudo bash deploy.sh
```

部署脚本会自动完成：
- 系统依赖安装 (Docker, Nginx, etc.)
- 防火墙配置
- 代码拉取
- 配置文件生成
- 应用构建和启动
- Nginx 反向代理配置

---

## 🔧 手动部署

如果你需要更精细的控制，可以按以下步骤手动部署。

### 1. 系统准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose ufw

# 启动 Docker
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. 配置防火墙

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw --force enable
```

### 3. 拉取代码

```bash
# 创建应用目录
sudo mkdir -p /opt/artistic-nav
sudo cd /opt/artistic-nav

# 拉取代码
sudo git clone https://github.com/ychech/YC-Navigation.git .
```

### 4. 配置环境变量

```bash
# 复制环境模板
sudo cp deploy/.env.example .env

# 编辑配置
sudo nano .env
```

关键配置项：
```env
# 数据库: 2C2G 推荐 sqlite
DB_PROVIDER=sqlite
DATABASE_URL="file:./data/prod.db"

# 管理员密码
ADMIN_PASSWORD=your_secure_password

# 访问地址
NEXTAUTH_URL=http://39.102.80.128

# 存储: 本地存储即可
STORAGE_TYPE=local
```

### 5. 配置 Docker Compose

```bash
# 复制生产配置
sudo cp deploy/docker-compose.yml docker-compose.yml
sudo cp deploy/Dockerfile Dockerfile
```

### 6. 配置 Nginx

```bash
# 复制 Nginx 配置
sudo cp deploy/nginx/artistic-nav.conf /etc/nginx/sites-available/artistic-nav

# 启用配置
sudo ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重载
sudo nginx -t && sudo systemctl reload nginx
```

### 7. 构建和启动

```bash
# 构建镜像
sudo docker-compose build --no-cache

# 启动服务
sudo docker-compose up -d

# 初始化数据库
sudo docker-compose exec -T nextjs npx prisma db push
sudo docker-compose exec -T nextjs npx prisma db seed
```

### 8. 访问应用

- **前台**: http://39.102.80.128
- **后台**: http://39.102.80.128/admin
- **默认账号**: `admin` / 你在 `.env` 中设置的密码

---

## ⚙️ 配置说明

### 数据库配置对比

| 特性 | SQLite (推荐) | MySQL |
|------|--------------|-------|
| 内存占用 | ~180MB | ~700MB |
| 并发性能 | 一般 | 优秀 |
| 数据迁移 | 复制文件即可 | 需要导出导入 |
| 备份 | 简单 | 较复杂 |
| 适用场景 | 个人/小团队 | 高并发/多用户 |

### 存储配置对比

| 特性 | 本地存储 | 阿里云 OSS |
|------|---------|-----------|
| 成本 | 免费 (磁盘空间) | 按量付费 |
| 可靠性 | 依赖服务器 | 99.9999999% |
| CDN 加速 | 需额外配置 | 原生支持 |
| 适用场景 | 入门/测试 | 生产/大规模 |

---

## 🗄️ 数据库选择

### 使用 SQLite (推荐 2C2G)

无需额外配置，数据库以文件形式存储在 `./data/prod.db`。

**优点**:
- 内存占用低 (~180MB)
- 零配置
- 备份简单 (复制文件)

**限制**:
- 不适合极高并发
- 数据库文件不能放在网络存储

### 使用 MySQL

修改 `docker-compose.yml` 取消 MySQL 服务的注释，并修改 `.env`：

```env
DB_PROVIDER=mysql
DATABASE_URL="mysql://navuser:your_password@mysql:3306/artistic_nav"
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_USER_PASSWORD=your_user_password
```

然后重启：
```bash
docker-compose down
docker-compose up -d
```

---

## 💾 存储选择

### 本地存储 (默认)

上传的文件存储在服务器的 `./uploads` 目录。

**备份命令**:
```bash
tar -czf uploads-backup.tar.gz ./uploads
```

### 阿里云 OSS

1. 创建 OSS Bucket
2. 获取 AccessKey ID 和 Secret
3. 修改 `.env`：

```env
STORAGE_TYPE=oss
OSS_REGION=oss-cn-beijing
OSS_BUCKET=your-bucket-name
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
```

---

## 🔒 SSL/HTTPS 配置

### 使用 Certbot (免费 Let's Encrypt)

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书 (替换为你的域名)
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 手动配置 SSL

编辑 `/etc/nginx/sites-available/artistic-nav`：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # ... 其他配置
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔨 运维管理

使用 `artistic-nav` 命令进行日常管理：

```bash
# 查看状态
artistic-nav status

# 查看日志
artistic-nav logs
artistic-nav logs -f  # 实时日志

# 重启应用
artistic-nav restart

# 备份数据
artistic-nav backup

# 更新代码
artistic-nav update

# 查看管理员密码
artistic-nav admin

# 显示帮助
artistic-nav help
```

### 手动 Docker 命令

```bash
cd /opt/artistic-nav

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f nextjs

# 进入容器
docker-compose exec nextjs sh

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重建镜像
docker-compose build --no-cache
```

### 数据备份

**自动备份脚本** (`/opt/artistic-nav/backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# 备份数据库
cp /opt/artistic-nav/data/prod.db $BACKUP_DIR/

# 备份上传文件
tar -czf $BACKUP_DIR/uploads.tar.gz -C /opt/artistic-nav uploads

# 保留最近 7 天的备份
find /opt/backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null

echo "Backup completed: $BACKUP_DIR"
```

添加到定时任务：
```bash
crontab -e
# 添加: 0 2 * * * /opt/artistic-nav/backup.sh >> /var/log/backup.log 2>&1
```

---

## 🐛 故障排查

### 应用无法启动

```bash
# 查看详细日志
docker-compose logs nextjs

# 检查端口占用
sudo lsof -i :3000

# 检查磁盘空间
df -h
```

### 数据库连接错误

```bash
# SQLite 权限检查
ls -la /opt/artistic-nav/data/
sudo chown -R 1001:1001 /opt/artistic-nav/data/

# 重新初始化
docker-compose exec nextjs npx prisma db push
```

### Nginx 502 错误

```bash
# 检查 Nginx 配置
sudo nginx -t

# 检查后端服务
curl http://localhost:3000

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/artistic-nav-error.log
```

### 内存不足

2C2G 服务器如果内存不足：

1. **使用 SQLite 而非 MySQL**
2. **添加 Swap 分区**：
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔐 安全建议

1. **修改默认密码**
   - 首次登录后立即修改管理员密码

2. **禁用 root SSH 登录**
```bash
sudo nano /etc/ssh/sshd_config
# 设置: PermitRootLogin no
sudo systemctl restart sshd
```

3. **定期更新系统**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **配置 fail2ban 防暴力破解**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

5. **数据库安全**
   - 如果使用 MySQL，确保强密码
   - 定期备份数据
   - 不要将数据库端口暴露到公网

---

## ⬆️ 升级更新

### 自动更新 (推荐)

```bash
artistic-nav update
```

### 手动更新

```bash
cd /opt/artistic-nav

# 拉取最新代码
git pull origin main

# 重建并重启
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 数据库迁移 (如有需要)
docker-compose exec -T nextjs npx prisma migrate deploy
```

### 回滚

```bash
# 查看备份列表
ls -la /opt/artistic-nav/backups/

# 恢复指定备份
artistic-nav restore 20240115_120000
```

---

## 📞 支持

遇到问题？

1. 查看日志：`artistic-nav logs`
2. 检查 [故障排查](#故障排查) 章节
3. 提交 Issue: https://github.com/ychech/YC-Navigation/issues

---

**部署完成！** 🎉

访问 http://39.102.80.128 开始体验艺术导航。
