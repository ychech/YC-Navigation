#!/bin/bash
# Artistic Navigation - Docker 部署脚本
# 用法: ./deploy.sh [环境变量文件路径]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        echo_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    echo_info "Docker 版本: $(docker --version)"
    echo_info "Docker Compose 版本: $(docker compose version)"
}

# 加载环境变量
load_env() {
    local env_file="${1:-.env}"
    
    if [ -f "$env_file" ]; then
        echo_info "加载环境变量: $env_file"
        export $(grep -v '^#' "$env_file" | xargs)
    else
        echo_warn "环境变量文件 $env_file 不存在，使用默认配置"
    fi
    
    # 设置默认值
    export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}
    export ADMIN_PASSWORD=${ADMIN_PASSWORD:-$(openssl rand -base64 12)}
    export NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost}
    
    echo_info "NEXTAUTH_URL: $NEXTAUTH_URL"
    echo_info "ADMIN_PASSWORD: $ADMIN_PASSWORD"
}

# 构建镜像
build() {
    echo_info "构建 Docker 镜像..."
    docker compose build --no-cache
}

# 启动服务
start() {
    echo_info "启动服务..."
    docker compose up -d
    
    echo_info "等待服务启动..."
    sleep 10
    
    # 检查健康状态
    if docker compose ps | grep -q "healthy"; then
        echo_info "服务已启动并健康运行"
    else
        echo_warn "服务可能还在启动中，请稍后检查"
    fi
}

# 初始化数据库
init_db() {
    echo_info "初始化数据库..."
    
    # 等待数据库就绪
    sleep 5
    
    # 执行数据库迁移
    docker compose exec -T app npx prisma migrate deploy || {
        echo_warn "迁移失败，尝试直接创建数据库..."
        docker compose exec -T app npx prisma db push --accept-data-loss || true
    }
    
    echo_info "数据库初始化完成"
}

# 显示状态
status() {
    echo_info "服务状态:"
    docker compose ps
    
    echo_info "\n访问地址:"
    echo "  前台: http://localhost 或 $NEXTAUTH_URL"
    echo "  后台: http://localhost/admin 或 $NEXTAUTH_URL/admin"
    echo "  管理员密码: $ADMIN_PASSWORD"
}

# 主函数
main() {
    echo_info "开始部署 Artistic Navigation..."
    
    check_docker
    load_env "$1"
    build
    start
    init_db
    status
    
    echo_info "部署完成！"
}

# 处理命令
 case "${1:-deploy}" in
    deploy)
        main "$2"
        ;;
    start)
        load_env "$2"
        start
        status
        ;;
    stop)
        echo_info "停止服务..."
        docker compose down
        ;;
    restart)
        echo_info "重启服务..."
        docker compose restart
        sleep 5
        status
        ;;
    logs)
        docker compose logs -f
        ;;
    update)
        echo_info "更新部署..."
        docker compose pull
        docker compose up -d
        ;;
    *)
        echo "用法: $0 {deploy|start|stop|restart|logs|update} [环境变量文件]"
        exit 1
        ;;
esac
