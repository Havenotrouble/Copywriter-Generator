#!/bin/bash

# 查看服务日志的便捷脚本

# 如果指定了服务名，只查看该服务日志
if [ -n "$1" ]; then
    docker compose logs -f --tail=100 $1
else
    # 否则查看所有服务日志
    docker compose logs -f --tail=100
fi
