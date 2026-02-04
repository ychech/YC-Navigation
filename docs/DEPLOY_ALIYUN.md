# 阿里云服务器部署指南 (Docker 方案)

本指南将帮助你将 `Artistic Nav` 项目部署到阿里云 ECS 服务器上。我们采用 Docker + Docker Compose 的方式，这是最现代、最稳健的部署方案。

## 1. 准备工作

### 1.1 服务器环境准备
登录你的阿里云服务器，确保已安装以下软件：

*   **Docker**: [安装教程](https://help.aliyun.com/document_detail/51853.html)
*   **Docker Compose**: (通常随 Docker Desktop 安装，Linux 可能需要单独安装)
*   **Git**: 用于拉取代码

```bash
# 检查是否安装成功
docker --version
docker-compose --version
git --version
```

### 1.2 阿里云 OSS 准备 (可选)
如果你想使用 OSS 存储图片，请准备好以下信息：
*   Region (如 `oss-cn-hangzhou`)
*   AccessKey ID
*   AccessKey Secret
*   Bucket Name

---

## 2. 部署步骤

### 2.1 获取代码
在服务器上克隆你的仓库：

```bash
cd /opt
git clone https://github.com/your-username/artistic-nav.git
cd artistic-nav
```

### 2.2 配置环境变量
你需要创建一个 `.env` 文件来配置生产环境参数。我们已经在 `docker-compose.yml` 中定义了变量映射，你可以直接修改 `docker-compose.yml` 或者创建一个 `.env` 文件供 compose 读取。

**推荐方式：创建 `.env` 文件**

```bash
touch .env
vim .env
```

在 `.env` 中填入以下内容：

```env
# 管理员密码 (必填)
ADMIN_PASSWORD=your_secure_password_here

# 存储策略 (local 或 oss)
STORAGE_TYPE=oss

# 阿里云 OSS 配置 (如果 STORAGE_TYPE=oss 则必填)
OSS_REGION=oss-cn-shanghai
OSS_ACCESS_KEY_ID=LTAI5t...
OSS_ACCESS_KEY_SECRET=abcdef...
OSS_BUCKET=your-bucket-name
# 如果配置了自定义域名/CDN，请填入 (例如: https://cdn.example.com)
# 如果没配置，留空或使用阿里云默认域名
OSS_DOMAIN=https://your-bucket.oss-cn-shanghai.aliyuncs.com
```

### 2.3 执行部署脚本
项目根目录下已经准备好了 `deploy.sh` 脚本。

```bash
./deploy.sh
```

这个脚本会自动：
1.  构建 Docker 镜像 (基于 `Dockerfile`)
2.  启动容器 (基于 `docker-compose.yml`)
3.  清理旧的无用镜像

### 2.4 验证部署
部署完成后，访问你的服务器 IP 或域名：
`http://your-server-ip:3000`

---

## 3. 常见问题排查

### 3.1 数据库持久化
本项目默认使用 SQLite (`dev.db`)。
*   **在 Docker 中**：我们通过 `docker-compose.yml` 中的 `volumes` 将容器内的数据库文件挂载到了宿主机的 `./prisma/dev.db`。
*   **注意**：请确保服务器上的 `./prisma` 目录有写入权限。

### 3.2 图片上传失败 (Local 模式)
如果是 Local 模式，图片存储在 `./public/uploads`。
*   **权限问题**：Docker 容器内的用户可能没有权限写入宿主机目录。
*   **解决**：
    ```bash
    chmod -R 777 public/uploads
    ```

### 3.3 图片上传失败 (OSS 模式)
*   检查 `.env` 中的 AccessKey 是否有对应 Bucket 的读写权限。
*   检查 Bucket 的跨域设置 (CORS)，允许你的域名访问。

---

## 4. 进阶：使用 Nginx 反向代理 + HTTPS (推荐)

直接暴露 3000 端口并不安全，建议使用 Nginx 进行反向代理并配置 SSL。

1.  **安装 Nginx**: `apt install nginx`
2.  **配置 Nginx**:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  **配置 HTTPS**: 建议使用 `certbot` 自动申请免费证书。
