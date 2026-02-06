#!/bin/bash
#
# 艺术导航 - 阿里云 ECS 一键部署脚本
# 适用于: Ubuntu 22.04 LTS + 2C2G 配置
# 公网IP: 39.102.80.128
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="artistic-nav"
GITHUB_REPO="https://github.com/ychech/YC-Navigation.git"
INSTALL_DIR="/opt/$APP_NAME"
DOMAIN="39.102.80.128"  # 默认使用IP，可修改为域名
USE_SSL=false
DB_TYPE="sqlite"  # sqlite 或 mysql
STORAGE_TYPE="local"  # local 或 oss

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              艺术导航 - 阿里云 ECS 一键部署                  ║"
    echo "║                                                            ║"
    echo "║  服务器: Ubuntu 22.04 LTS                                 ║"
    echo "║  配置: 2核2G (推荐使用 SQLite 模式)                        ║"
    echo "║  公网IP: 39.102.80.128                                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "请使用 root 权限运行此脚本"
        print_info "使用方法: sudo bash deploy.sh"
        exit 1
    fi
}

# 交互式配置
interactive_config() {
    print_info "开始配置部署参数..."
    echo ""
    
    # 数据库选择
    echo -e "${YELLOW}选择数据库类型:${NC}"
    echo "  1) SQLite (推荐，适合2C2G，内存占用~180MB)"
    echo "  2) MySQL (适合高并发，内存占用~700MB)"
    read -p "请选择 [1-2] (默认: 1): " db_choice
    
    case $db_choice in
        2)
            DB_TYPE="mysql"
            print_info "已选择: MySQL"
            ;;
        *)
            DB_TYPE="sqlite"
            print_info "已选择: SQLite"
            ;;
    esac
    echo ""
    
    # 存储选择
    echo -e "${YELLOW}选择存储方式:${NC}"
    echo "  1) 本地存储 (文件存储在服务器本地)"
    echo "  2) 阿里云OSS (需要配置OSS参数)"
    read -p "请选择 [1-2] (默认: 1): " storage_choice
    
    case $storage_choice in
        2)
            STORAGE_TYPE="oss"
            print_info "已选择: 阿里云OSS"
            read -p "请输入OSS Region (如: oss-cn-beijing): " OSS_REGION
            read -p "请输入OSS Bucket名称: " OSS_BUCKET
            read -p "请输入OSS AccessKey ID: " OSS_ACCESS_KEY_ID
            read -s -p "请输入OSS AccessKey Secret: " OSS_ACCESS_KEY_SECRET
            echo ""
            ;;
        *)
            STORAGE_TYPE="local"
            print_info "已选择: 本地存储"
            ;;
    esac
    echo ""
    
    # 域名配置
    read -p "是否配置自定义域名? [y/N] (默认: 使用IP 39.102.80.128): " has_domain
    if [[ $has_domain =~ ^[Yy]$ ]]; then
        read -p "请输入域名 (如: nav.yourdomain.com): " DOMAIN
        read -p "是否启用SSL/HTTPS? [y/N] " enable_ssl
        if [[ $enable_ssl =~ ^[Yy]$ ]]; then
            USE_SSL=true
            print_info "SSL将在部署完成后使用 certbot 配置"
        fi
    fi
    
    echo ""
    print_success "配置完成！"
    echo -e "  数据库: ${GREEN}$DB_TYPE${NC}"
    echo -e "  存储: ${GREEN}$STORAGE_TYPE${NC}"
    echo -e "  访问地址: ${GREEN}http://$DOMAIN${NC}"
    if $USE_SSL; then
        echo -e "  HTTPS: ${GREEN}启用${NC}"
    fi
    echo ""
    
    read -p "按回车键开始部署，或按 Ctrl+C 取消..."
}

# 安装系统依赖
install_dependencies() {
    print_info "更新系统并安装依赖..."
    
    apt-get update
    apt-get install -y \
        curl \
        wget \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        docker.io \
        docker-compose \
        ufw \
        fail2ban
    
    # 启动 Docker
    systemctl enable docker
    systemctl start docker
    
    print_success "系统依赖安装完成"
}

# 配置防火墙
setup_firewall() {
    print_info "配置防火墙..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp      # SSH
    ufw allow 80/tcp      # HTTP
    ufw allow 443/tcp     # HTTPS
    
    ufw --force enable
    
    print_success "防火墙配置完成"
    print_info "开放端口: 22(SSH), 80(HTTP), 443(HTTPS)"
}

# 创建应用目录结构
create_directories() {
    print_info "创建应用目录..."
    
    mkdir -p $INSTALL_DIR
    mkdir -p $INSTALL_DIR/data
    mkdir -p $INSTALL_DIR/uploads
    mkdir -p $INSTALL_DIR/logs
    mkdir -p $INSTALL_DIR/backups
    
    print_success "目录创建完成: $INSTALL_DIR"
}

# 拉取代码
pull_code() {
    print_info "从 GitHub 拉取代码..."
    
    cd $INSTALL_DIR
    
    if [ -d ".git" ]; then
        git pull origin main
    else
        git clone $GITHUB_REPO .
    fi
    
    print_success "代码更新完成"
}

# 创建环境配置文件
create_env_file() {
    print_info "创建环境配置文件..."
    
    local env_file="$INSTALL_DIR/.env"
    local admin_password=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-12)
    
    cat > $env_file << EOF
# ============================================
# 艺术导航 - 生产环境配置
# ============================================

# 数据库配置
# sqlite: 轻量级，适合2C2G (推荐)
# mysql: 高性能，需要更多内存
DB_PROVIDER=$DB_TYPE

# SQLite 配置 (DB_PROVIDER=sqlite 时使用)
DATABASE_URL="file:./data/prod.db"

# MySQL 配置 (DB_PROVIDER=mysql 时使用)
# DATABASE_URL="mysql://root:your_password@mysql:3306/artistic_nav"

# Next.js 配置
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://$DOMAIN

# 管理员密码 (默认随机生成)
ADMIN_PASSWORD=$admin_password

# 存储配置
# local: 本地文件存储
# oss: 阿里云对象存储
STORAGE_TYPE=$STORAGE_TYPE

# 本地存储路径 (STORAGE_TYPE=local 时使用)
UPLOAD_DIR=./uploads

# OSS 配置 (STORAGE_TYPE=oss 时使用)
EOF

    if [ "$STORAGE_TYPE" = "oss" ]; then
        cat >> $env_file << EOF
OSS_REGION=${OSS_REGION:-oss-cn-beijing}
OSS_BUCKET=${OSS_BUCKET:-}
OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID:-}
OSS_ACCESS_KEY_SECRET=${OSS_ACCESS_KEY_SECRET:-}
OSS_ENDPOINT=https://\${OSS_REGION}.aliyuncs.com
OSS_CDN_DOMAIN=
EOF
    fi
    
    # 设置权限
    chmod 600 $env_file
    
    print_success "环境配置文件创建完成"
    print_warning "管理员初始密码: $admin_password"
    print_warning "请记录此密码，首次登录后可在后台修改"
    echo "$admin_password" > $INSTALL_DIR/.admin_password
    chmod 600 $INSTALL_DIR/.admin_password
}

# 创建 Docker Compose 配置
create_docker_compose() {
    print_info "创建 Docker Compose 配置..."
    
    local compose_file="$INSTALL_DIR/docker-compose.yml"
    
    # 基础服务配置
    cat > $compose_file << 'EOF'
version: '3.8'

services:
  # Next.js 应用服务
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: artistic-nav-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      # 数据持久化
      - ./data:/app/data
      - ./uploads:/app/public/uploads
      - ./logs:/app/logs
    networks:
      - artistic-nav-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1.5G
        reservations:
          cpus: '0.5'
          memory: 256M
EOF

    # MySQL 服务配置（仅在需要时添加）
    if [ "$DB_TYPE" = "mysql" ]; then
        cat >> $compose_file << 'EOF'

  # MySQL 数据库 (仅在 DB_PROVIDER=mysql 时使用)
  mysql:
    image: mysql:8.0
    container_name: artistic-nav-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root_password_123}
      MYSQL_DATABASE: artistic_nav
      MYSQL_USER: navuser
      MYSQL_PASSWORD: ${MYSQL_USER_PASSWORD:-nav_password_123}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init/mysql:/docker-entrypoint-initdb.d
    networks:
      - artistic-nav-network
    command: --default-authentication-plugin=mysql_native_password
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

volumes:
  mysql-data:
EOF
    fi

    # 网络配置
    cat >> $compose_file << 'EOF'

networks:
  artistic-nav-network:
    driver: bridge
EOF

    print_success "Docker Compose 配置创建完成"
}

# 配置 Nginx
setup_nginx() {
    print_info "配置 Nginx..."
    
    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/artistic-nav << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 日志配置
    access_log /var/log/nginx/artistic-nav-access.log;
    error_log /var/log/nginx/artistic-nav-error.log;

    # 文件上传大小限制
    client_max_body_size 50M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 主应用代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

    # 启用配置
    ln -sf /etc/nginx/sites-available/artistic-nav /etc/nginx/sites-enabled/
    
    # 测试并重载 Nginx
    nginx -t && systemctl reload nginx
    
    print_success "Nginx 配置完成"
}

# 配置 SSL（可选）
setup_ssl() {
    if ! $USE_SSL; then
        return
    fi
    
    print_info "配置 SSL 证书..."
    
    # 使用 certbot 申请证书
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # 设置自动续期
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    print_success "SSL 证书配置完成"
    print_info "证书将自动续期"
}

# 构建并启动应用
start_application() {
    print_info "构建并启动应用..."
    
    cd $INSTALL_DIR
    
    # 构建 Docker 镜像
    docker-compose build --no-cache
    
    # 启动服务
    docker-compose up -d
    
    # 等待服务启动
    print_info "等待服务启动..."
    sleep 10
    
    # 初始化数据库（仅在 SQLite 首次启动时）
    if [ "$DB_TYPE" = "sqlite" ]; then
        docker-compose exec -T nextjs npx prisma db push
        docker-compose exec -T nextjs npx prisma db seed || true
    fi
    
    print_success "应用启动完成"
}

# 创建管理脚本
create_management_scripts() {
    print_info "创建运维管理脚本..."
    
    # 创建管理脚本目录
    mkdir -p /usr/local/bin
    
    # 主管理脚本
    cat > /usr/local/bin/artistic-nav << 'EOF'
#!/bin/bash

INSTALL_DIR="/opt/artistic-nav"

show_help() {
    echo "艺术导航管理脚本"
    echo ""
    echo "使用方法: artistic-nav [命令]"
    echo ""
    echo "可用命令:"
    echo "  start       启动应用"
    echo "  stop        停止应用"
    echo "  restart     重启应用"
    echo "  status      查看状态"
    echo "  logs        查看日志"
    echo "  update      更新到最新版本"
    echo "  backup      备份数据"
    echo "  restore     恢复数据"
    echo "  clean       清理未使用的 Docker 资源"
    echo "  admin       显示管理员密码"
    echo "  help        显示帮助"
}

case "$1" in
    start)
        cd $INSTALL_DIR && docker-compose up -d
        echo "✓ 应用已启动"
        ;;
    stop)
        cd $INSTALL_DIR && docker-compose down
        echo "✓ 应用已停止"
        ;;
    restart)
        cd $INSTALL_DIR && docker-compose restart
        echo "✓ 应用已重启"
        ;;
    status)
        cd $INSTALL_DIR && docker-compose ps
        ;;
    logs)
        cd $INSTALL_DIR && docker-compose logs -f ${2:-}
        ;;
    update)
        echo "正在更新..."
        cd $INSTALL_DIR
        docker-compose down
        git pull origin main
        docker-compose build --no-cache
        docker-compose up -d
        echo "✓ 更新完成"
        ;;
    backup)
        BACKUP_DIR="$INSTALL_DIR/backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p $BACKUP_DIR
        
        # 备份数据库
        if [ -f "$INSTALL_DIR/data/prod.db" ]; then
            cp $INSTALL_DIR/data/prod.db $BACKUP_DIR/
        fi
        
        # 备份上传文件
        if [ -d "$INSTALL_DIR/uploads" ]; then
            tar -czf $BACKUP_DIR/uploads.tar.gz -C $INSTALL_DIR uploads
        fi
        
        # 备份环境配置
        cp $INSTALL_DIR/.env $BACKUP_DIR/
        
        echo "✓ 备份完成: $BACKUP_DIR"
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "请指定备份目录"
            echo "可用备份:"
            ls -1 $INSTALL_DIR/backups/
            exit 1
        fi
        
        BACKUP_DIR="$INSTALL_DIR/backups/$2"
        
        # 恢复数据库
        if [ -f "$BACKUP_DIR/prod.db" ]; then
            cp $BACKUP_DIR/prod.db $INSTALL_DIR/data/
            echo "✓ 数据库已恢复"
        fi
        
        # 恢复上传文件
        if [ -f "$BACKUP_DIR/uploads.tar.gz" ]; then
            tar -xzf $BACKUP_DIR/uploads.tar.gz -C $INSTALL_DIR
            echo "✓ 上传文件已恢复"
        fi
        
        # 重启应用
        cd $INSTALL_DIR && docker-compose restart
        echo "✓ 恢复完成，应用已重启"
        ;;
    clean)
        docker system prune -af
        echo "✓ 清理完成"
        ;;
    admin)
        if [ -f "$INSTALL_DIR/.admin_password" ]; then
            echo "管理员密码: $(cat $INSTALL_DIR/.admin_password)"
        else
            echo "未找到密码文件"
        fi
        ;;
    help|*)
        show_help
        ;;
esac
EOF

    chmod +x /usr/local/bin/artistic-nav
    
    print_success "管理脚本已创建: artistic-nav"
}

# 显示部署完成信息
show_completion() {
    local admin_pass=$(cat $INSTALL_DIR/.admin_password 2>/dev/null || echo "unknown")
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    🎉 部署完成！ 🎉${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BLUE}访问地址:${NC}"
    if $USE_SSL; then
        echo -e "    • 前台: ${GREEN}https://$DOMAIN${NC}"
        echo -e "    • 后台: ${GREEN}https://$DOMAIN/admin${NC}"
    else
        echo -e "    • 前台: ${GREEN}http://$DOMAIN${NC}"
        echo -e "    • 后台: ${GREEN}http://$DOMAIN/admin${NC}"
    fi
    echo ""
    echo -e "  ${BLUE}管理员账号:${NC}"
    echo -e "    • 用户名: ${GREEN}admin${NC}"
    echo -e "    • 密码:   ${GREEN}$admin_pass${NC}"
    echo ""
    echo -e "  ${BLUE}管理命令:${NC}"
    echo -e "    • artistic-nav status    # 查看状态"
    echo -e "    • artistic-nav logs      # 查看日志"
    echo -e "    • artistic-nav backup    # 备份数据"
    echo -e "    • artistic-nav update    # 更新代码"
    echo ""
    echo -e "  ${BLUE}文件位置:${NC}"
    echo -e "    • 应用目录: ${GREEN}$INSTALL_DIR${NC}"
    echo -e "    • 数据库:   ${GREEN}$INSTALL_DIR/data/${NC}"
    echo -e "    • 上传文件: ${GREEN}$INSTALL_DIR/uploads/${NC}"
    echo -e "    • 日志:     ${GREEN}$INSTALL_DIR/logs/${NC}"
    echo ""
    echo -e "${YELLOW}提示: 首次登录后请立即修改管理员密码${NC}"
    echo ""
}

# 主函数
main() {
    show_welcome
    check_root
    interactive_config
    
    print_info "开始部署..."
    
    install_dependencies
    setup_firewall
    create_directories
    pull_code
    create_env_file
    create_docker_compose
    setup_nginx
    setup_ssl
    start_application
    create_management_scripts
    
    show_completion
}

# 运行主函数
main "$@"
