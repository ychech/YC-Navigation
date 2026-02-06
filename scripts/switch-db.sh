#!/bin/bash

# ==========================================
# 数据库模式切换脚本
# Usage: ./scripts/switch-db.sh [sqlite|mysql]
# ==========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请指定数据库模式${NC}"
    echo "用法: ./scripts/switch-db.sh [sqlite|mysql]"
    echo ""
    echo "示例:"
    echo "  ./scripts/switch-db.sh sqlite   # 切换到 SQLite 模式"
    echo "  ./scripts/switch-db.sh mysql    # 切换到 MySQL 模式"
    exit 1
fi

DB_MODE=$1

if [ "$DB_MODE" != "sqlite" ] && [ "$DB_MODE" != "mysql" ]; then
    echo -e "${RED}错误: 不支持的数据库模式 '$DB_MODE'${NC}"
    echo "支持的模式: sqlite, mysql"
    exit 1
fi

echo -e "${YELLOW}==========================================${NC}"
echo -e "${YELLOW}  切换到 $DB_MODE 模式${NC}"
echo -e "${YELLOW}==========================================${NC}"
echo ""

# 备份当前的 schema.prisma
if [ -f "prisma/schema.prisma" ]; then
    cp prisma/schema.prisma "prisma/schema.prisma.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 复制对应的 schema 文件
echo -e "${BLUE}→ 复制 prisma/schema.$DB_MODE.prisma → prisma/schema.prisma${NC}"
cp "prisma/schema.$DB_MODE.prisma" "prisma/schema.prisma"
echo -e "${GREEN}✓ Schema 文件已更新${NC}"
echo ""

# 更新 .env 文件
if [ "$DB_MODE" == "sqlite" ]; then
    echo -e "${YELLOW}配置 SQLite 模式...${NC}"
    
    # 使用 sed 替换或添加配置
    if grep -q "^# DB_PROVIDER=" .env 2>/dev/null || grep -q "^DB_PROVIDER=" .env 2>/dev/null; then
        sed -i 's/^# DB_PROVIDER=.*/DB_PROVIDER=sqlite/' .env 2>/dev/null || true
        sed -i 's/^DB_PROVIDER=.*/DB_PROVIDER=sqlite/' .env 2>/dev/null || true
    fi
    
    # 注释掉 MySQL 的 DATABASE_URL，添加 SQLite 的
    sed -i 's|^DATABASE_URL="mysql://|# DATABASE_URL="mysql://|' .env 2>/dev/null || true
    
    if ! grep -q 'DATABASE_URL="file:' .env 2>/dev/null; then
        echo '' >> .env
        echo '# SQLite Configuration' >> .env
        echo 'DATABASE_URL="file:./prisma/dev.db"' >> .env
    fi
    
    echo -e "${GREEN}✓ 已更新 .env 文件${NC}"
    echo ""
    echo -e "${YELLOW}下一步操作:${NC}"
    echo "  1. ${BLUE}npx prisma generate${NC}     # 生成 SQLite 引擎的 Prisma Client"
    echo "  2. ${BLUE}npx prisma db push${NC}      # 推送数据库结构"
    echo "  3. ${BLUE}npm run build${NC}           # 重新构建项目"
    echo "  4. ${BLUE}pm2 restart artistic-nav${NC} 或 ${BLUE}npm start${NC}"
    
elif [ "$DB_MODE" == "mysql" ]; then
    echo -e "${YELLOW}配置 MySQL 模式...${NC}"
    
    # 注释掉 SQLite 的 DATABASE_URL
    sed -i 's|^DATABASE_URL="file:|# DATABASE_URL="file:|' .env 2>/dev/null || true
    
    # 取消注释 MySQL 的 DATABASE_URL（如果存在）
    sed -i 's|^# DATABASE_URL="mysql://|DATABASE_URL="mysql://|' .env 2>/dev/null || true
    
    # 检查是否已配置 MySQL 连接串
    if ! grep -q 'DATABASE_URL="mysql://' .env 2>/dev/null; then
        echo -e "${YELLOW}! 请手动配置 DATABASE_URL 为你的 MySQL 连接串${NC}"
        echo "  例如: DATABASE_URL=\"mysql://root:password@localhost:3306/artistic_nav\""
        echo '' >> .env
        echo '# MySQL Configuration' >> .env
        echo '# DATABASE_URL="mysql://root:password@localhost:3306/artistic_nav"' >> .env
    fi
    
    echo -e "${GREEN}✓ 已更新 .env 文件${NC}"
    echo ""
    echo -e "${YELLOW}下一步操作:${NC}"
    echo "  1. ${BLUE}确保 MySQL 服务已启动${NC}"
    echo "  2. ${BLUE}确认 .env 中的 DATABASE_URL 配置正确${NC}"
    echo "  3. ${BLUE}npx prisma generate${NC}     # 生成 MySQL 引擎的 Prisma Client"
    echo "  4. ${BLUE}npx prisma db push${NC}      # 推送数据库结构到 MySQL"
    echo "  5. ${BLUE}npm run build${NC}           # 重新构建项目"
    echo "  6. ${BLUE}pm2 restart artistic-nav${NC} 或 ${BLUE}npm start${NC}"
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  配置完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${BLUE}提示: 切换数据库模式后，原数据库中的数据不会自动迁移。${NC}"
echo -e "${BLUE}      如需迁移数据，请使用数据库导出导入工具。${NC}"
