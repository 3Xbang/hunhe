#!/bin/bash

echo "===== 开始PM2部署 ====="

# 检查环境变量
echo "检查环境变量..."
node check-env.js
if [ $? -ne 0 ]; then
  echo "环境变量检查失败，中止部署"
  exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 确保pm2已安装
echo "确保PM2已安装..."
npm list -g pm2 || npm install -g pm2

# 创建日志目录
echo "创建日志目录..."
mkdir -p logs/pm2

# 停止现有应用实例
echo "停止现有应用实例..."
pm2 stop construction-app 2>/dev/null || true

# 使用PM2启动应用
echo "使用PM2启动应用..."
pm2 start pm2.config.js --env production

# 保存PM2配置，确保服务器重启时自动启动
echo "保存PM2配置..."
pm2 save

# 显示应用状态
echo "应用状态:"
pm2 list

# 等待应用完全启动
echo "等待应用启动..."
sleep 5

# 验证应用健康状态
echo "验证应用健康状态..."
curl -s http://localhost:3000/health || echo "无法访问健康检查端点，请检查应用状态"

echo "===== PM2部署完成 =====" 