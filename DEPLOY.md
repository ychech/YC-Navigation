# 阿里云 ECS 部署指南

> **服务器**: 阿里云 ECS 2核2G, Ubuntu 22.04 LTS  
> **公网IP**: 39.102.80.128  
> **仓库**: https://github.com/ychech/YC-Navigation

---

## 🚀 一键部署 (5分钟完成)

```bash
# 1. SSH 登录服务器
ssh root@39.102.80.128

# 2. 下载并运行部署脚本
curl -fsSL https://raw.githubusercontent.com/ychech/YC-Navigation/main/deploy/deploy.sh -o deploy.sh
sudo bash deploy.sh
```

部署脚本会自动处理所有配置，包括：
- 安装 Docker、Nginx、SSL 工具
- 配置防火墙 (开放 22/80/443)
- 拉取最新代码
- 生成配置文件
- 构建并启动应用
- 配置反向代理

---

## 📁 部署文件说明

```
deploy/
├── deploy.sh              # 一键部署脚本
├── docker-compose.yml     # Docker 生产配置
├── Dockerfile             # 生产镜像构建
├── nginx/
│   └── artistic-nav.conf  # Nginx 配置模板
├── .env.example           # 环境变量模板
└── README.md              # 详细部署文档
```

---

## ⚡ 快速命令

部署完成后，使用以下命令管理应用：

```bash
# 查看状态
artistic-nav status

# 查看日志
artistic-nav logs

# 重启应用
artistic-nav restart

# 备份数据
artistic-nav backup

# 更新代码
artistic-nav update

# 显示管理员密码
artistic-nav admin
```

---

## 🔧 配置说明

### 数据库选择

| 类型 | 内存占用 | 适用场景 |
|------|---------|---------|
| **SQLite** (推荐) | ~180MB | 2C2G 服务器，个人/小团队 |
| MySQL | ~700MB | 高并发，多用户 |

> 💡 **建议**: 2C2G 配置请使用 SQLite，性能足够且省内存。

### 存储选择

| 类型 | 说明 |
|------|------|
| **本地存储** (推荐) | 文件存在服务器，简单免费 |
| 阿里云 OSS | 高可靠，适合大规模，按量付费 |

---

## 🔐 安全配置

首次部署后，请立即：

1. **修改管理员密码**
   - 访问: http://39.102.80.128/admin
   - 默认账号: `admin`
   - 密码查看: `artistic-nav admin`

2. **配置 HTTPS** (如果有域名)
```bash
# 安装 SSL 证书 (替换为你的域名)
sudo certbot --nginx -d your-domain.com
```

---

## 📊 目录结构

部署后服务器上的文件结构：

```
/opt/artistic-nav/
├── data/              # SQLite 数据库
├── uploads/           # 上传的文件
├── logs/              # 应用日志
├── backups/           # 自动备份
├── .env               # 环境配置 (保密)
├── .admin_password    # 初始密码 (保密)
└── ...                # 源代码
```

---

## 🐛 常见问题

### 应用无法访问

```bash
# 检查服务状态
artistic-nav status

# 检查 Nginx
curl http://localhost:3000
sudo nginx -t
```

### 内存不足

```bash
# 添加 2G Swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 数据库错误

```bash
# 检查数据库权限
sudo chown -R 1001:1001 /opt/artistic-nav/data/

# 重新初始化
docker-compose exec -T nextjs npx prisma db push
```

---

## 🔄 自动更新 (GitHub Actions)

已配置 GitHub Actions 自动部署，需要设置 Secrets：

1. 打开仓库 Settings → Secrets and variables → Actions
2. 添加以下 secrets:
   - `ECS_HOST`: 39.102.80.128
   - `ECS_USER`: root
   - `ECS_SSH_KEY`: 你的 SSH 私钥

推送代码到 main 分支会自动部署到服务器。

---

## 📚 详细文档

查看完整部署文档: [deploy/README.md](deploy/README.md)

包含：
- 手动部署步骤
- SSL 详细配置
- 故障排查
- 安全加固
- 数据备份恢复
