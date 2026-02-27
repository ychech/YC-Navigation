# PM2 部署

PM2 是 Node.js 的进程管理器，适合快速部署和低配置服务器。

## 前置要求

- Node.js 18+
- PM2: `npm install -g pm2`

## 部署步骤

### 1. 克隆项目

```bash
git clone https://github.com/ychech/YC-Navigation.git
cd YC-Navigation
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env
```

### 4. 构建项目

```bash
npm run build
```

### 5. 配置 PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'artistic-nav',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/YC-Navigation',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

### 6. 启动服务

```bash
pm2 start ecosystem.config.js
```

### 7. 保存配置

```bash
pm2 save
pm2 startup
```

## 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs artistic-nav

# 重启
pm2 restart artistic-nav

# 停止
pm2 stop artistic-nav

# 删除
pm2 delete artistic-nav
```

## 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
