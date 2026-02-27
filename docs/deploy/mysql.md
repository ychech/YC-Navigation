# MySQL 数据库配置

Artistic Nav 支持使用 MySQL 作为数据库，适合团队使用或数据量较大的场景。

## 前置要求

- MySQL 8.0+ 或 MariaDB 10.5+
- 已创建数据库和用户

## 配置步骤

### 1. 创建数据库

```sql
CREATE DATABASE artistic_nav 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'artistic_nav'@'%' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON artistic_nav.* TO 'artistic_nav'@'%';
FLUSH PRIVILEGES;
```

### 2. 修改 Prisma 配置

编辑 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. 配置环境变量

```env
DATABASE_URL=mysql://artistic_nav:your-password@localhost:3306/artistic_nav
DB_PROVIDER=mysql
```

### 4. 重新生成 Prisma Client

```bash
npx prisma generate
npx prisma db push
```

---

## Docker Compose 使用 MySQL

创建 `docker-compose.mysql.yml`：

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://artistic_nav:password@db:3306/artistic_nav
      - DB_PROVIDER=mysql
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    depends_on:
      - db
    volumes:
      - uploads-data:/app/public/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=artistic_nav
      - MYSQL_USER=artistic_nav
      - MYSQL_PASSWORD=password
    volumes:
      - mysql-data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app

volumes:
  mysql-data:
  uploads-data:
```

启动：

```bash
docker-compose -f docker-compose.mysql.yml up -d
```

---

## 数据迁移

从 SQLite 迁移到 MySQL：

```bash
# 1. 导出 SQLite 数据
sqlite3 prisma/dev.db .dump > backup.sql

# 2. 修改 schema.prisma 为 MySQL
# 3. 重新生成客户端
npx prisma generate

# 4. 导入到 MySQL
mysql -u artistic_nav -p artistic_nav < backup.sql
```

---

## 性能优化

MySQL 配置建议（`my.cnf`）：

```ini
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```
