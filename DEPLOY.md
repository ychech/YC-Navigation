# Artistic Navigation - 部署指南

## 快速开始（3 分钟部署）

### 1. 服务器准备

```bash
# 安装 Docker 和 Nginx
apt-get update
apt-get install -y docker.io nginx sqlite3
```

### 2. 上传代码

```bash
# 在本地执行
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' \
  ./ root@your-server-ip:/opt/artistic-nav/
```

### 3. 一键部署

```bash
# 在服务器执行
cd /opt/artistic-nav
./scripts/deploy.sh
```

部署完成后访问：
- 前台：http://your-server-ip
- 后台：http://your-server-ip/admin
- 默认密码：`WOijjIZ73jrwZqL`（可在 .env 中修改）

---

## 手动部署步骤

### 1. 构建镜像

```bash
cd /opt/artistic-nav
docker build -t artistic-nav:v2.0 .
```

### 2. 创建数据目录

```bash
mkdir -p /opt/artistic-nav/data/prisma
mkdir -p /opt/artistic-nav/data/uploads
chmod -R 777 /opt/artistic-nav/data
```

### 3. 初始化数据库

```bash
sqlite3 /opt/artistic-nav/data/prisma/dev.db < /opt/artistic-nav/scripts/init.sql
```

### 4. 启动容器

```bash
docker run -d \
  --name artistic-nav \
  --restart always \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/app/prisma/dev.db \
  -e DB_PROVIDER=sqlite \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NEXTAUTH_URL=http://your-server-ip \
  -e ADMIN_PASSWORD=your-password \
  -e STORAGE_TYPE=local \
  -v /opt/artistic-nav/data/prisma:/app/prisma \
  -v /opt/artistic-nav/data/uploads:/app/public/uploads \
  artistic-nav:v2.0
```

### 5. 配置 Nginx

```bash
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

---

## 目录结构

```
/opt/artistic-nav/
├── data/
│   ├── prisma/          # SQLite 数据库
│   │   └── dev.db
│   └── uploads/         # 上传的文件
├── scripts/
│   ├── deploy.sh        # 部署脚本
│   └── init.sql         # 数据库初始化
├── Dockerfile           # Docker 构建
└── DEPLOY.md           # 本文档
```

---

## 常用命令

```bash
# 查看日志
docker logs -f artistic-nav

# 重启服务
docker restart artistic-nav

# 停止服务
docker stop artistic-nav && docker rm artistic-nav

# 备份数据
cp /opt/artistic-nav/data/prisma/dev.db /backup/dev.db.$(date +%s)

# 进入容器
docker exec -it artistic-nav sh
```

---

## 更新代码

```bash
cd /opt/artistic-nav

# 1. 备份数据
cp data/prisma/dev.db /backup/

# 2. 拉取新代码
git pull origin main

# 3. 重新构建
docker build -t artistic-nav:v2.1 .

# 4. 停止旧容器
docker stop artistic-nav && docker rm artistic-nav

# 5. 启动新容器
docker run -d \
  --name artistic-nav \
  --restart always \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/app/prisma/dev.db \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NEXTAUTH_URL=http://your-server-ip \
  -e ADMIN_PASSWORD=your-password \
  -e STORAGE_TYPE=local \
  -v /opt/artistic-nav/data/prisma:/app/prisma \
  -v /opt/artistic-nav/data/uploads:/app/public/uploads \
  artistic-nav:v2.1
```

---

## 故障排查

### 数据库权限问题
```bash
chmod -R 777 /opt/artistic-nav/data
```

### 上传失败
```bash
# 检查上传目录权限
ls -la /opt/artistic-nav/data/uploads

# 修复权限
chown -R 1001:1001 /opt/artistic-nav/data/uploads
chmod 777 /opt/artistic-nav/data/uploads
```

### 容器无法启动
```bash
# 查看日志
docker logs artistic-nav

# 检查端口占用
netstat -tlnp | grep 3000
```

---

## 安全建议

1. **修改默认密码**：在 `.env` 文件中修改 `ADMIN_PASSWORD`
2. **使用 HTTPS**：配置 SSL 证书
3. **定期备份**：设置定时任务备份数据库
4. **防火墙**：只开放 80/443 端口
