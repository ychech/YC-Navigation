#!/bin/bash
# Artistic Navigation - 一键部署脚本

set -e

echo "========================================"
echo "  Artistic Navigation 部署脚本"
echo "========================================"
echo ""

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 root 权限运行: sudo ./deploy.sh"
    exit 1
fi

# 配置
APP_DIR="/opt/artistic-nav"
DATA_DIR="$APP_DIR/data"
IMAGE_NAME="artistic-nav:v2.0"
CONTAINER_NAME="artistic-nav"

# 1. 检查依赖
echo "[1/6] 检查依赖..."
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    apt-get update
    apt-get install -y docker.io
fi

if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt-get install -y nginx
fi

if ! command -v sqlite3 &> /dev/null; then
    echo "安装 SQLite..."
    apt-get install -y sqlite3
fi

echo "✓ 依赖检查完成"

# 2. 创建目录
echo "[2/6] 创建数据目录..."
mkdir -p "$DATA_DIR/prisma"
mkdir -p "$DATA_DIR/uploads"
chmod -R 777 "$DATA_DIR"
echo "✓ 目录创建完成"

# 3. 初始化数据库
echo "[3/6] 初始化数据库..."
if [ ! -f "$DATA_DIR/prisma/dev.db" ]; then
    sqlite3 "$DATA_DIR/prisma/dev.db" < "$APP_DIR/scripts/init.sql"
    echo "✓ 数据库初始化完成"
else
    echo "✓ 数据库已存在，跳过初始化"
fi

# 4. 构建镜像
echo "[4/6] 构建 Docker 镜像..."
cd "$APP_DIR"
if ! docker images | grep -q "$IMAGE_NAME"; then
    docker build -t "$IMAGE_NAME" .
    echo "✓ 镜像构建完成"
else
    echo "✓ 镜像已存在，跳过构建"
fi

# 5. 启动容器
echo "[5/6] 启动容器..."

# 停止旧容器
if docker ps -a | grep -q "$CONTAINER_NAME"; then
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
fi

# 启动新容器
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:/app/prisma/dev.db \
  -e DB_PROVIDER=sqlite \
  -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}" \
  -e NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost}" \
  -e ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 12)}" \
  -e STORAGE_TYPE=local \
  -v "$DATA_DIR/prisma:/app/prisma" \
  -v "$DATA_DIR/uploads:/app/public/uploads" \
  "$IMAGE_NAME"

# 等待容器启动
sleep 5

# 检查容器状态
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✓ 容器启动成功"
else
    echo "✗ 容器启动失败"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

# 6. 配置 Nginx
echo "[6/6] 配置 Nginx..."

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

ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

if nginx -t; then
    systemctl restart nginx
    echo "✓ Nginx 配置完成"
else
    echo "✗ Nginx 配置失败"
    exit 1
fi

# 显示结果
echo ""
echo "========================================"
echo "  ✅ 部署完成！"
echo "========================================"
echo ""
echo "  前台: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
echo "  后台: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')/admin"
echo "  密码: $(docker exec $CONTAINER_NAME printenv ADMIN_PASSWORD 2>/dev/null || echo '查看 .env 文件')"
echo ""
echo "  数据目录: $DATA_DIR"
echo "  容器名称: $CONTAINER_NAME"
echo ""
echo "  常用命令:"
echo "    查看日志: docker logs -f $CONTAINER_NAME"
echo "    重启服务: docker restart $CONTAINER_NAME"
echo "    备份数据: cp $DATA_DIR/prisma/dev.db /backup/"
echo ""
echo "========================================"
