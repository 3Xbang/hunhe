#!/bin/bash

echo "===== 开始部署 ====="

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

# 安装forever（如果尚未安装）
echo "确保forever已安装..."
npm list -g forever || npm install -g forever

# 检查是否有已存在的应用进程，如有则停止
echo "检查现有进程..."
forever list | grep "src/app.js" && forever stop src/app.js

# 启动应用
echo "启动应用..."
NODE_ENV=production forever start -a --uid "construction-app" src/app.js

# 检查应用是否成功启动
echo "等待应用启动..."
sleep 5
forever list

# 验证应用健康状态
echo "验证应用健康状态..."
curl -s http://localhost:3000/health || echo "无法访问健康检查端点，请检查应用状态"

echo "===== 部署完成 =====" 