.PHONY: help deploy start stop restart status logs clean backup health

# 默认目标
help:
	@echo "Copywriter Generator - 可用命令:"
	@echo ""
	@echo "  make deploy        - 一键部署（构建+启动+清理）"
	@echo "  make start         - 启动所有服务"
	@echo "  make stop          - 停止所有服务"
	@echo "  make restart       - 重启所有服务"
	@echo "  make status        - 查看服务状态"
	@echo "  make logs          - 查看所有日志"
	@echo "  make logs-backend  - 查看后端日志"
	@echo "  make logs-frontend - 查看前端日志"
	@echo "  make logs-nginx    - 查看 Nginx 日志"
	@echo "  make health        - 健康检查"
	@echo "  make clean         - 清理无用镜像和容器"
	@echo "  make backup        - 备份项目文件"
	@echo "  make build         - 构建镜像"
	@echo "  make rebuild       - 重新构建镜像（无缓存）"
	@echo ""

# 一键部署
deploy:
	@./deploy.sh

# 启动服务
start:
	@echo "启动服务..."
	@docker compose up -d
	@echo "服务已启动"
	@make status

# 停止服务
stop:
	@./stop.sh

# 重启服务
restart:
	@./quick-restart.sh

# 查看状态
status:
	@./status.sh

# 查看所有日志
logs:
	@docker compose logs -f --tail=100

# 查看后端日志
logs-backend:
	@docker compose logs -f --tail=100 backend

# 查看前端日志
logs-frontend:
	@docker compose logs -f --tail=100 frontend

# 查看 Nginx 日志
logs-nginx:
	@docker compose logs -f --tail=100 nginx

# 健康检查
health:
	@./health-check.sh

# 清理无用资源
clean:
	@echo "清理无用 Docker 资源..."
	@docker image prune -f
	@docker container prune -f
	@docker network prune -f
	@echo "清理完成"

# 备份
backup:
	@./backup.sh

# 构建镜像
build:
	@echo "构建镜像..."
	@docker compose build
	@echo "构建完成"

# 重新构建镜像（无缓存）
rebuild:
	@echo "重新构建镜像（无缓存）..."
	@docker compose build --no-cache
	@echo "构建完成"

# 查看磁盘使用
disk:
	@docker system df

# 进入后端容器
shell-backend:
	@docker compose exec backend sh

# 进入前端容器
shell-frontend:
	@docker compose exec frontend sh

# 进入 Nginx 容器
shell-nginx:
	@docker compose exec nginx sh
