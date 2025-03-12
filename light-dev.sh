#!/bin/bash

echo "===== 启动轻量级开发环境 ====="

# 检查环境文件
if [ ! -f .env ]; then
  echo "创建开发环境变量文件..."
  cp .env.example .env
  echo "请确保.env文件中的MongoDB连接信息正确"
  sleep 2
fi

# 清理缓存
echo "清理开发缓存..."
npm run clean

# 清理Docker系统临时文件
echo "清理Docker临时文件..."
if command -v docker &> /dev/null; then
  docker system prune -f --volumes
fi

# 设置低内存模式环境变量
export NODE_OPTIONS="--max-old-space-size=200"

# 启动轻量级开发模式
echo "启动轻量级开发服务器..."
echo "注意: 此模式不依赖Kubernetes，直接在本地运行Node.js"
echo "您可以直接编辑代码，应用会自动重新加载"
echo "要停止开发环境，请按 Ctrl+C"
echo ""

# 启动开发服务器
npm run lightweight-dev 