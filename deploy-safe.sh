#!/bin/bash
#
# 安全部署脚本 - 使用非 root 用户
#

set -e

# 配置
APP_NAME="artistic-nav"
APP_USER="artistic-nav"
APP_DIR="/home/${APP_USER}/${APP_NAME}"
NODE_VERSION="20"

echo "=========================================="
echo "  艺术导航 - 安全部署脚本"
echo "=========================================="
echo ""

# 检查是否以 root 运行
if [[ $EUID -eq 0 ]]; then
   echo "❌ 错误: 请不要使用 root 用户运行此脚本"
   echo "请使用: sudo -u ${APP_USER} bash deploy-safe.sh"
   exit 1
fi

# 创建应用目录
mkdir -p ${APP_DIR}
cd ${APP_DIR}

# 克隆代码（如果不存在）
if [ ! -d ".git" ]; then
    echo "📥 克隆代码..."
    git clone https://github.com/ychech/YC-Navigation.git .
fi

# 更新代码
echo "🔄 更新代码..."
git pull origin main

# 安装依赖
echo "📦 安装依赖..."
npm ci --production=false

# 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate

# 初始化数据库（如果不存在）
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️ 初始化数据库..."
    npx prisma db push --accept-data-loss
    npx prisma db seed
fi

# 构建应用
echo "🔨 构建应用..."
npm run build

# 使用 PM2 启动（如果已安装）
if command -v pm2 &> /dev/null; then
    echo "🚀 启动应用 (PM2)..."
    pm2 delete ${APP_NAME} 2>/dev/null || true
    pm2 start npm --name ${APP_NAME} -- run start
    pm2 save
else
    echo "⚠️ PM2 未安装，使用 node 直接启动..."
    echo "建议安装 PM2: npm install -g pm2"
    nohup npm run start > app.log 2>&1 &
fi

echo ""
echo "=========================================="
echo "  ✅ 部署完成"
echo "=========================================="
echo ""
echo "应用目录: ${APP_DIR}"
echo "日志: ${APP_DIR}/app.log"
echo ""
