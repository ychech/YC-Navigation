#!/bin/bash

# 艺术导航一键部署脚本
# 支持: Node.js + PM2 / Docker
# 适用: Ubuntu 22.04 LTS, 2C2G+

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查 root 权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "请使用 root 权限运行: sudo bash deploy.sh"
    fi
}

# 检查系统
check_system() {
    log "检查系统环境..."
    
    # 检查 Ubuntu
    if ! grep -q "Ubuntu" /etc/os-release; then
        warn "非 Ubuntu 系统，可能不兼容"
    fi
    
    # 检查内存
    MEM=$(free -m | awk '/^Mem:/{print $2}')
    log "内存: ${MEM}MB"
    
    # 检查架构
    ARCH=$(uname -m)
    log "架构: $ARCH"
}

# 添加 Swap
add_swap() {
    if ! swapon --show | grep -q swap; then
        log "添加 4G Swap..."
        fallocate -l 4G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        success "Swap 添加完成"
    else
        log "Swap 已存在，跳过"
    fi
}

# 安装基础依赖
install_base() {
    log "更新系统..."
    apt-get update -qq
    
    log "安装基础依赖..."
    apt-get install -y -qq curl wget git nginx ufw
    success "基础依赖安装完成"
}

# 安装 Node.js
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log "Node.js 已安装: $NODE_VERSION"
        return
    fi
    
    log "安装 Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
    success "Node.js 安装完成: $(node -v)"
}

# 安装 PM2
install_pm2() {
    if command -v pm2 &> /dev/null; then
        log "PM2 已安装"
        return
    fi
    
    log "安装 PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    success "PM2 安装完成"
}

# 克隆代码
clone_code() {
    if [ -d "/opt/artistic-nav" ]; then
        log "代码已存在，更新..."
        cd /opt/artistic-nav
        git pull
    else
        log "克隆代码..."
        cd /opt
        git clone https://github.com/ychech/YC-Navigation.git artistic-nav
        cd artistic-nav
    fi
    success "代码准备完成"
}

# 配置环境
setup_env() {
    log "配置环境变量..."
    
    # 生成随机密钥
    SECRET=$(openssl rand -base64 32)
    
    # 获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me || echo "localhost")
    
    cat > .env << EOF
# 数据库
DB_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db

# 安全（请修改密码！）
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=http://$SERVER_IP
ADMIN_PASSWORD=admin123456

# 存储
STORAGE_TYPE=local
UPLOAD_DIR=./public/uploads

# 其他
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF
    
    success "环境配置完成"
    warn "默认密码: admin123456，请登录后立即修改！"
}

# 安装依赖并构建
build_app() {
    log "安装依赖..."
    npm ci --omit=dev
    
    log "生成 Prisma Client..."
    npx prisma generate
    
    log "初始化数据库..."
    npx prisma db push --accept-data-loss
    npx prisma db seed
    
    log "构建应用..."
    npm run build
    
    success "构建完成"
}

# 启动应用
start_app() {
    log "启动应用..."
    pm2 delete artistic-nav 2>/dev/null || true
    pm2 start npm --name "artistic-nav" -- run start
    pm2 save
    success "应用已启动"
}

# 配置 Nginx
setup_nginx() {
    log "配置 Nginx..."
    
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
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    success "Nginx 配置完成"
}

# 配置防火墙
setup_firewall() {
    log "配置防火墙..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "y" | ufw enable
    success "防火墙配置完成"
}

# 显示完成信息
show_finish() {
    SERVER_IP=$(curl -s ifconfig.me || echo "localhost")
    
    echo ""
    echo "========================================"
    echo "  🎨 艺术导航部署完成！"
    echo "========================================"
    echo ""
    echo "  前台: http://$SERVER_IP"
    echo "  后台: http://$SERVER_IP/admin"
    echo "  账号: admin"
    echo "  密码: admin123456"
    echo ""
    echo "  常用命令:"
    echo "    pm2 status       # 查看状态"
    echo "    pm2 logs         # 查看日志"
    echo "    pm2 restart all  # 重启应用"
    echo ""
    echo "  配置文件: /opt/artistic-nav/.env"
    echo ""
    echo "========================================"
    echo ""
    warn "请立即登录后台修改默认密码！"
}

# Node.js 部署主流程
deploy_nodejs() {
    log "开始 Node.js + PM2 部署..."
    
    check_root
    check_system
    add_swap
    install_base
    install_nodejs
    install_pm2
    clone_code
    setup_env
    build_app
    start_app
    setup_nginx
    setup_firewall
    
    success "Node.js 部署完成！"
    show_finish
}

# Docker 部署主流程
deploy_docker() {
    log "开始 Docker 部署..."
    
    check_root
    check_system
    
    # 检查内存
    MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$MEM" -lt 4096 ]; then
        error "Docker 部署需要 4G+ 内存，当前 ${MEM}MB"
        warn "请使用 Node.js 部署: bash deploy.sh nodejs"
    fi
    
    # 安装 Docker
    if ! command -v docker &> /dev/null; then
        log "安装 Docker..."
        apt-get update -qq
        apt-get install -y -qq docker.io docker-compose
        systemctl start docker
        systemctl enable docker
        success "Docker 安装完成"
    fi
    
    # 克隆代码
    clone_code
    cd /opt/artistic-nav
    
    # 配置环境
    SECRET=$(openssl rand -base64 32)
    SERVER_IP=$(curl -s ifconfig.me || echo "localhost")
    
    cat > .env << EOF
ADMIN_PASSWORD=admin123456
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=http://$SERVER_IP
STORAGE_TYPE=local
EOF
    
    # 启动
    cd deploy
    docker-compose build
    docker-compose up -d
    
    # 初始化数据库
    sleep 5
    docker-compose exec -T artistic-nav npx prisma db push --accept-data-loss
    docker-compose exec -T artistic-nav npx prisma db seed
    
    # 配置 Nginx
    setup_nginx
    setup_firewall
    
    success "Docker 部署完成！"
    show_finish
}

# 主入口
case "${1:-nodejs}" in
    nodejs|pm2)
        deploy_nodejs
        ;;
    docker)
        deploy_docker
        ;;
    *)
        echo "用法: sudo bash deploy.sh [nodejs|docker]"
        echo ""
        echo "选项:"
        echo "  nodejs  - Node.js + PM2 部署（推荐，适合 2C2G）"
        echo "  docker  - Docker 部署（需要 4G+ 内存）"
        echo ""
        echo "示例:"
        echo "  sudo bash deploy.sh           # 默认 Node.js 部署"
        echo "  sudo bash deploy.sh nodejs    # Node.js 部署"
        echo "  sudo bash deploy.sh docker    # Docker 部署"
        exit 1
        ;;
esac
