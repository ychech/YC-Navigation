# 部署指南

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **安全提醒**: 请务必阅读 [SECURITY.md](./SECURITY.md) 了解安全加固措施

---

## 方案对比

| 方案 | 内存占用 | 安全性 | 适用场景 | 推荐度 |
|------|---------|--------|---------|--------|
| **Docker** | ~400MB | ⭐⭐⭐ 高（容器隔离） | 2C2G+，生产环境 | ⭐⭐⭐ |
| **Node.js + PM2** | ~150MB | ⭐⭐ 中 | 2C2G，开发/测试 | ⭐⭐ |

> 💡 **推荐**: Docker 部署提供进程隔离和文件系统保护，即使应用被入侵也能限制攻击范围

---

## 🚀 一键部署（推荐）

### Docker（推荐，安全性更高）

```bash
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

### Node.js + PM2（资源占用更低）

```bash
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash
```

---

## 为什么 Docker 在 2C2G 上可行

### 资源优化配置

```yaml
# docker-compose.yml 资源限制
deploy:
  resources:
    limits:
      cpus: '1.5'      # 限制 1.5 核
      memory: 1.5G     # 限制 1.5G 内存
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Docker 安全优势

| 特性 | 说明 | 防护效果 |
|------|------|---------|
| **进程隔离** | 应用运行在独立 PID 命名空间 | 无法看到宿主机进程 |
| **文件系统隔离** | 只读根文件系统 + 受控挂载 | 无法修改系统文件 |
| **网络隔离** | 独立网络命名空间 | 限制网络访问范围 |
| **非 root 运行** | 容器内使用普通用户 | 降低权限提升风险 |
| **资源限制** | CPU/内存硬限制 | 防止资源耗尽攻击 |

### 内存优化措施

1. **Alpine Linux 基础镜像** - 仅 5MB 基础体积
2. **多阶段构建** - 仅保留生产必需文件
3. **Node.js 内存限制** - 自动垃圾回收优化
4. **Swap 配置** - 4G Swap 作为缓冲

---

## 方案一：Docker 部署（推荐）

### 1. 服务器准备

```bash
# 系统更新
apt-get update && apt-get upgrade -y

# 添加 Swap（重要！）
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 2. 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash -
systemctl enable docker
systemctl start docker

# 配置镜像加速（国内服务器）
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://你的ID.mirror.aliyuncs.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker
```

### 3. 克隆代码并配置

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav

# 生成安全密码
ADMIN_PASS=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-16)
SECRET=$(openssl rand -base64 32)
SERVER_IP=$(curl -s ifconfig.me)

# 创建环境配置
cat > .env << EOF
ADMIN_PASSWORD=$ADMIN_PASS
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=http://$SERVER_IP
STORAGE_TYPE=local
EOF

# 保存密码
echo "Admin Password: $ADMIN_PASS" > /root/.artistic-nav-credentials
chmod 600 /root/.artistic-nav-credentials

mkdir -p prisma public/uploads
```

### 4. 启动容器

```bash
cd deploy

# 构建并启动
docker-compose up -d --build

# 等待启动完成
sleep 10

# 初始化数据库
docker-compose exec -T artistic-nav npx prisma db push --accept-data-loss
docker-compose exec -T artistic-nav npx prisma db seed

# 查看状态
docker-compose ps
```

### 5. 配置 Nginx

```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/artistic-nav << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 50M;
    
    # 安全响应头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
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

### 6. 配置防火墙

```bash
ufw default deny incoming
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny from 178.16.52.253  # 封禁已知恶意 IP
echo "y" | ufw enable
```

---

## 方案二：Node.js + PM2 部署

详见下方手动部署步骤或使用一键部署脚本。

---

## 阿里云 OSS 配置（可选）

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

# Docker 重启
cd /opt/artistic-nav/deploy && docker-compose restart artistic-nav

# 或 PM2 重启
pm2 restart artistic-nav
```

---

## HTTPS 配置

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com --non-interactive --agree-tos -m your-email@example.com
```

---

## 运维命令

### Docker 运维

```bash
cd /opt/artistic-nav/deploy

# 查看状态
docker-compose ps
docker stats artistic-nav

# 查看日志
docker-compose logs -f artistic-nav

# 重启
docker-compose restart artistic-nav

# 更新代码
cd /opt/artistic-nav
git pull
cd deploy
docker-compose up -d --build

# 进入容器调试
docker-compose exec artistic-nav sh

# 备份数据
docker-compose exec artistic-nav tar -czf /tmp/backup.tar.gz prisma/dev.db public/uploads
docker cp artistic-nav:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz
```

### PM2 运维

```bash
pm2 status
pm2 logs
pm2 restart artistic-nav
```

---

## 安全加固

### 1. 定期更新

```bash
# 更新系统
apt-get update && apt-get upgrade -y

# 更新应用
cd /opt/artistic-nav
git pull
docker-compose up -d --build  # Docker
# 或 npm ci && npm run build && pm2 restart  # PM2
```

### 2. 监控告警

```bash
# 安装监控脚本
cat > /opt/artistic-nav/security-monitor.sh << 'EOF'
#!/bin/bash
# 检查可疑进程
if docker-compose exec -T artistic-nav ps aux | grep -E "(wget|curl).*http"; then
    echo "[ALERT] 发现可疑进程" | logger -t security-alert
fi
EOF
chmod +x /opt/artistic-nav/security-monitor.sh

# 添加到定时任务
crontab -e
*/5 * * * * /opt/artistic-nav/security-monitor.sh
```

### 3. 定期备份

```bash
crontab -e
# 每天凌晨3点备份
0 3 * * * cd /opt/artistic-nav/deploy && docker-compose exec -T artistic-nav tar -czf /backup/artistic-nav-$(date +\%Y\%m\%d).tar.gz prisma/dev.db public/uploads
```

---

## 访问地址

- **前台**: http://YOUR_SERVER_IP
- **后台**: http://YOUR_SERVER_IP/admin
- **默认账号**: `admin`
- **密码**: 查看 `/root/.artistic-nav-credentials`

---

## 常见问题

### Docker 内存不足

```bash
# 增加 Swap
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile

# 或限制 Node.js 内存
docker-compose exec artistic-nav node --max-old-space-size=1024 server.js
```

### 容器无法启动

```bash
# 查看日志
docker-compose logs artistic-nav

# 检查资源使用
docker stats --no-stream
```

### 数据库权限错误

```bash
chmod -R 777 /opt/artistic-nav/prisma
chmod -R 777 /opt/artistic-nav/public/uploads
```
