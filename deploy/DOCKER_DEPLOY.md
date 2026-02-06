# Docker 部署方案

## ⚠️ 前提条件

Docker 方案需要满足以下条件：

| 条件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| **内存** | 4G RAM | 4G+ RAM |
| **磁盘** | 20G 可用空间 | 40G+ |
| **网络** | 能稳定访问 Docker Hub | 有国内镜像加速 |

**2C2G 服务器为什么不推荐 Docker**：
- Docker 守护进程占用 ~300MB 内存
- Node.js 镜像 + 构建过程需要 ~1.5G 内存
- 总计需要 ~2G+，2C2G 服务器容易 OOM

---

## 🚀 Docker 部署步骤

### 1. 前提检查

```bash
# 检查内存
free -h
# 确保可用内存 > 2G

# 检查 Docker
docker --version
docker-compose --version
```

### 2. 配置镜像加速（国内服务器必需）

```bash
# 编辑 Docker 配置
mkdir -p /etc/docker

# 如果有阿里云账号，使用自己的加速器地址
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://你的ID.mirror.aliyuncs.com",
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live"
  ]
}
EOF

# 重启 Docker
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
NEXTAUTH_URL=http://39.102.80.128
ADMIN_PASSWORD=admin123456
STORAGE_TYPE=local
UPLOAD_DIR=./public/uploads
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF

# 创建必要的目录
mkdir -p prisma public/uploads logs
```

### 4. 构建并启动

```bash
# 进入 deploy 目录
cd deploy

# 构建镜像
docker-compose build

# 启动
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

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `deploy/Dockerfile` | 多阶段构建 Dockerfile |
| `deploy/docker-compose.yml` | 容器编排配置 |
| `prisma/dev.db` | SQLite 数据库（挂载到容器） |
| `public/uploads/` | 上传文件（挂载到容器） |

---

## 🐛 常见问题

### 1. 拉取镜像超时

```bash
# 配置多个镜像源
# 如果所有镜像源都失败，说明网络问题严重，改用 Node.js 直接部署
```

### 2. 构建时内存不足

```bash
# 添加 Swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### 3. 数据库权限错误

```bash
# 确保宿主机目录权限正确
chmod -R 777 /opt/artistic-nav/prisma
chmod -R 777 /opt/artistic-nav/public/uploads
```

### 4. 容器内无法访问数据库

```bash
# 检查挂载是否正确
docker-compose exec nextjs ls -la /app/prisma/

# 手动复制数据库到容器
docker cp /opt/artistic-nav/prisma/dev.db artistic-nav-app:/app/prisma/
```

---

## 🔍 配置文件验证

### Dockerfile 关键检查点

✅ **deps 阶段**：安装所有依赖（包括 devDependencies）  
✅ **builder 阶段**：执行 `npm run build` 和 `prisma generate`  
✅ **runner 阶段**：复制 standalone 输出和 Prisma 运行时文件  
✅ **非 root 用户**：使用 `USER nextjs` 运行  

### docker-compose.yml 关键检查点

✅ **volumes**：正确挂载 `prisma/` 和 `public/uploads/`  
✅ **env_file**：加载 `.env` 文件  
✅ **resources**：限制内存使用防止 OOM  
✅ **healthcheck**：检查 `/api/health`  

---

## 📊 性能对比

| 部署方式 | 内存占用 | 启动时间 | 适用场景 |
|---------|---------|---------|---------|
| **Node.js + PM2** | ~100MB | 快 | 2C2G 服务器 |
| **Docker** | ~400MB | 慢 | 4G+ 内存服务器 |
| **Docker + MySQL** | ~900MB | 慢 | 高并发场景 |

---

## ✅ 总结

Docker 方案**内容正确**，但在 2C2G 服务器上会遇到：
1. 网络问题（拉取镜像超时）
2. 内存问题（构建时容易 OOM）

**建议**：
- 2C2G 服务器 → 使用 Node.js + PM2 直接部署
- 4G+ 内存服务器 → 可以使用 Docker
