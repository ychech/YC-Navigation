# Docker 部署指南

> ⚠️ **前提条件**: 需要 4G+ 内存，2C2G 服务器请使用 Node.js + PM2 方案

---

## 快速开始（一键部署）

```bash
# 下载并执行一键部署脚本
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy.sh | sudo bash -s docker
```

或手动部署：

```bash
# 1. 克隆代码
git clone https://github.com/ychech/YC-Navigation.git /opt/artistic-nav
cd /opt/artistic-nav

# 2. 执行部署
sudo bash deploy.sh docker
```

---

## 前置要求

- 内存: 4G+ RAM
- 磁盘: 20G+ 可用空间
- 系统: Ubuntu 20.04/22.04 LTS

---

## 手动部署步骤

### 1. 安装 Docker

```bash
apt-get update
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

### 2. 配置镜像加速（国内服务器）

```bash
mkdir -p /etc/docker

cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://你的ID.mirror.aliyuncs.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

systemctl restart docker
```

### 3. 准备代码

```bash
cd /opt
git clone https://github.com/ychech/YC-Navigation.git artistic-nav
cd artistic-nav

# 创建环境配置
cat > .env << 'EOF'
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://your-domain.com
EOF

mkdir -p prisma public/uploads
```

### 4. 构建并启动

```bash
cd deploy
docker-compose build
docker-compose up -d

# 初始化数据库
docker-compose exec artistic-nav npx prisma db push
docker-compose exec artistic-nav npx prisma db seed
```

### 5. 配置 Nginx

```bash
apt-get install -y nginx

cp nginx/artistic-nav.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/artistic-nav.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 管理命令

```bash
cd /opt/artistic-nav/deploy

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f artistic-nav

# 重启
docker-compose restart artistic-nav

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

## 常见问题

### 拉取镜像超时

配置多个镜像源，或使用一键部署脚本。

### 构建时内存不足

```bash
# 添加 Swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### 数据库权限错误

```bash
chmod -R 777 /opt/artistic-nav/prisma
chmod -R 777 /opt/artistic-nav/public/uploads
```
