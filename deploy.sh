#!/bin/bash

# Copywriter Generator 一键部署脚本
# 功能：拉取最新镜像、重启服务、清理无用镜像

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印分隔线
print_separator() {
    echo "================================================================"
}

# 检查 Docker 和 Docker Compose 是否安装
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    log_success "依赖检查通过"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    docker compose down || true
    log_success "服务已停止"
}

# 拉取/构建最新镜像
build_images() {
    log_info "构建最新镜像..."
    print_separator

    # 使用 --no-cache 确保使用最新代码
    docker compose build --no-cache

    print_separator
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    docker compose up -d
    log_success "服务启动成功"
}

# 等待服务健康检查
wait_for_health() {
    log_info "等待服务健康检查..."

    # 最多等待 120 秒
    TIMEOUT=120
    ELAPSED=0

    while [ $ELAPSED -lt $TIMEOUT ]; do
        # 检查所有服务是否健康
        UNHEALTHY=$(docker compose ps --format json | grep -v '"Health":"healthy"' | grep -v '"Health":""' || true)

        if [ -z "$UNHEALTHY" ]; then
            log_success "所有服务健康检查通过"
            return 0
        fi

        echo -n "."
        sleep 5
        ELAPSED=$((ELAPSED + 5))
    done

    log_warning "健康检查超时，请手动检查服务状态"
}

# 清理无用镜像和资源
cleanup() {
    log_info "清理无用镜像和容器..."

    # 删除悬空镜像
    DANGLING=$(docker images -f "dangling=true" -q)
    if [ -n "$DANGLING" ]; then
        docker rmi $DANGLING || true
        log_success "已删除悬空镜像"
    else
        log_info "没有悬空镜像需要删除"
    fi

    # 清理停止的容器
    STOPPED=$(docker ps -a -q -f status=exited)
    if [ -n "$STOPPED" ]; then
        docker rm $STOPPED || true
        log_success "已删除停止的容器"
    else
        log_info "没有停止的容器需要删除"
    fi

    # 清理未使用的网络
    docker network prune -f || true

    # 清理未使用的卷（谨慎使用）
    log_warning "跳过卷清理以保护数据，如需清理请手动执行: docker volume prune"

    log_success "清理完成"
}

# 显示服务状态
show_status() {
    print_separator
    log_info "服务状态："
    docker compose ps
    print_separator

    log_info "磁盘使用情况："
    docker system df
    print_separator
}

# 显示访问信息
show_access_info() {
    log_success "部署完成！"
    echo ""
    log_info "访问地址："
    echo "  - 应用访问: http://localhost"
    echo "  - 健康检查: http://localhost/health"
    echo ""
    log_info "查看日志："
    echo "  - 所有服务: docker compose logs -f"
    echo "  - 前端日志: docker compose logs -f frontend"
    echo "  - 后端日志: docker compose logs -f backend"
    echo "  - Nginx日志: docker compose logs -f nginx"
    echo ""
    log_info "管理命令："
    echo "  - 停止服务: docker compose down"
    echo "  - 重启服务: docker compose restart"
    echo "  - 查看状态: docker compose ps"
}

# 主函数
main() {
    print_separator
    echo -e "${GREEN}Copywriter Generator 一键部署脚本${NC}"
    print_separator

    # 检查是否在项目根目录
    if [ ! -f "docker-compose.yml" ]; then
        log_error "请在项目根目录下执行此脚本"
        exit 1
    fi

    # 执行部署流程
    check_dependencies
    stop_services
    build_images
    start_services
    wait_for_health
    cleanup
    show_status
    show_access_info

    print_separator
}

# 执行主函数
main
