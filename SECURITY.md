# 安全加固指南

## 已修复的安全漏洞

### 1. SSRF (服务器端请求伪造)
**状态**: ✅ 已修复
- 添加了 URL 白名单验证
- 禁止访问内网 IP (10.x, 172.16-31.x, 192.168.x, 127.x)
- 禁止访问云元数据服务 (169.254.169.254)

### 2. 任意文件上传
**状态**: ✅ 已修复
- 限制文件类型为图片 (jpg, png, gif, webp, svg)
- 限制文件大小 (5MB)
- 使用随机文件名 (UUID)
- 移除可执行文件上传风险

### 3. API 未授权访问
**状态**: ✅ 已修复
- 所有管理 API 添加身份验证
- 上传、删除等敏感操作需要登录

## 部署安全建议

### 1. 使用非 root 用户部署

```bash
# 创建专用用户
sudo useradd -m -s /bin/bash artistic-nav
sudo usermod -aG sudo artistic-nav

# 切换到专用用户
su - artistic-nav

# 部署应用
cd /home/artistic-nav
git clone https://github.com/ychech/YC-Navigation.git
```

### 2. 使用 Docker 部署（推荐）

```bash
# 构建镜像
docker build -t artistic-nav .

# 运行容器（非 root）
docker run -d \
  --name artistic-nav \
  --user 1000:1000 \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  artistic-nav
```

### 3. 配置防火墙

```bash
# 只允许 80/443
sudo ufw default deny incoming
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 4. 修改默认密码

首次登录后立即修改：
- 后台: http://your-domain/admin
- 默认账号: `admin` / `admin123456`

### 5. 定期备份

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
tar -czf backup-$DATE.tar.gz \
  /opt/artistic-nav/prisma/dev.db \
  /opt/artistic-nav/public/uploads
```

## 安全头部配置

已在 next.config.ts 中添加：
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
