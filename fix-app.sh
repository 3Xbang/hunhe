#!/bin/bash

echo "===== 开始修复应用程序 ====="

# 1. 重新构建并推送镜像
echo "重新构建并推送镜像..."
docker build -t docker.io/3xbang/construction-app:fixed-$(date +%Y%m%d) -t docker.io/3xbang/construction-app:latest .
docker push docker.io/3xbang/construction-app:fixed-$(date +%Y%m%d)
docker push docker.io/3xbang/construction-app:latest

# 2. 更新Kubernetes部署
echo "更新Kubernetes部署..."
NAMESPACE="ns-jrnsq1vz"
POD_NAME="gybang1-release-lazgll"

# 使用kubectl重新部署
echo "请在Sealos仪表板上执行以下操作："
echo "1. 找到您的部署 '$POD_NAME'"
echo "2. 执行'kubectl rollout restart deployment/$POD_NAME -n $NAMESPACE'"
echo "3. 观察新的容器日志"

echo "===== 修复脚本完成 ====="
echo "请注意：如果问题仍然存在，请提供容器日志以进行进一步诊断" 