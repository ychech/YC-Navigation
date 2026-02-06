#!/bin/bash
#
# 艺术导航 - 阿里云 ECS 一键部署脚本
# 适用于: Ubuntu 22.04+ / 2C2G 配置
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 root 用户运行此脚本"
        exit 1
    fi
}

# 安装系统依赖
install_deps() {
    log_info "安装系统依赖..."
    apt-get update -qq
    apt-get install -y -qq git nginx curl
    log_info "系统依赖安装完成"
}

# 安装 Node.js 20
install_nodejs() {
    log_info "安装 Node.js 20..."
    if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) != "20" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
        apt-get install -y -qq nodejs
    fi
    log_info "Node.js 版本: $(node -v)"
}

# 添加 Swap
add_swap() {
    if ! swapon -s | grep -q "/swapfile"; then
        log_info "添加 2G Swap..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile >/dev/null 2>&1
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        log_info "Swap 添加完成"
    else
        log_info "Swap 已存在"
    fi
}

# 克隆代码
clone_code() {
    log_info "克隆代码..."
    cd /opt
    
    # 如果目录存在，备份后删除
    if [ -d "artistic-nav" ]; then
        log_warn "检测到旧目录，备份中..."
        mv artistic-nav "artistic-nav-backup-$(date +%Y%m%d%H%M%S)" 2>/dev/null || rm -rf artistic-nav
    fi
    
    # 克隆（最多重试3次）
    for i in 1 2 3; do
        log_info "尝试克隆 (第 $i 次)..."
        if git clone https://github.com/ychech/YC-Navigation.git artistic-nav 2>/dev/null; then
            log_info "代码克隆成功"
            return 0
        fi
        sleep 2
    done
    
    log_error "代码克隆失败，请检查网络连接"
    exit 1
}

# 安装项目依赖
install_project_deps() {
    log_info "安装项目依赖..."
    cd /opt/artistic-nav
    npm ci --silent 2>/dev/null || npm install
    log_info "依赖安装完成"
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."
    cd /opt/artistic-nav
    
    cat > .env << 'EOF'
DB_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://39.102.80.128
ADMIN_PASSWORD=admin123456
STORAGE_TYPE=local
UPLOAD_DIR=./public/uploads
NEXT_TELEMETRY_DISABLED=1
PORT=3000
EOF
    
    log_info "环境配置完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    cd /opt/artistic-nav
    
    npx prisma generate --quiet
    npx prisma db push --accept-data-loss --quiet
    
    # 导入种子数据
    log_info "导入种子数据..."
    npx prisma db seed --quiet 2>/dev/null || true
    
    log_info "数据库初始化完成"
}

# 构建应用
build_app() {
    log_info "构建应用..."
    cd /opt/artistic-nav
    npm run build --quiet
    log_info "构建完成"
}

# 安装 PM2 并启动
start_app() {
    log_info "安装 PM2..."
    npm install -g pm2 --silent 2>/dev/null || true
    
    log_info "启动应用..."
    cd /opt/artistic-nav
    
    # 停止旧进程
    pm2 delete artistic-nav 2>/dev/null || true
    
    # 启动
    pm2 start npm --name "artistic-nav" -- run start
    pm2 save >/dev/null 2>&1 || true
    
    log_info "应用启动完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    # 启用配置
    ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试并重载
    nginx -t && systemctl reload nginx
    
    log_info "Nginx 配置完成"
}

# 显示完成信息
show_completion() {
    echo ""
    echo "========================================"
    echo "  ✅ 部署完成！"
    echo "========================================"
    echo ""
    echo "🌐 访问地址:"
    echo "   http://$(curl -s ifconfig.me 2>/dev/null || echo '你的服务器IP')"
    echo ""
    echo "🔐 后台管理:"
    echo "   http://$(curl -s ifconfig.me 2>/dev/null || echo '你的服务器IP')/admin"
    echo "   账号: admin"
    echo "   密码: admin123456"
    echo ""
    echo "📊 应用状态:"
    pm2 status 2>/dev/null || echo "PM2 状态获取失败"
    echo ""
    echo "💡 常用命令:"
    echo "   pm2 status          查看状态"
    echo "   pm2 logs            查看日志"
    echo "   pm2 restart all     重启应用"
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "  艺术导航 - 一键部署脚本"
    echo "========================================"
    echo ""
    
    check_root
    
    # 执行部署步骤
    install_deps
    install_nodejs
    add_swap
    clone_code
    install_project_deps
    setup_env
    init_database
    build_app
    start_app
    setup_nginx
    
    show_completion
}

# 运行主函数
main "$@"
