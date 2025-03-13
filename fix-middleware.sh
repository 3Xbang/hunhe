#!/bin/bash

echo "===== 构建修复中间件的Docker镜像 ====="

# 基于之前的realfix创建新的Dockerfile
cp Dockerfile.realfix Dockerfile.fixmiddleware

# 构建新镜像
echo "构建修复中间件的Docker镜像..."
TAG=$(date +%Y%m%d%H%M)
docker build -f Dockerfile.fixmiddleware -t docker.io/3xbang/construction-app:fixmiddleware-${TAG} -t docker.io/3xbang/construction-app:latest .

# 推送镜像
echo "推送镜像到仓库..."
docker push docker.io/3xbang/construction-app:fixmiddleware-${TAG}
docker push docker.io/3xbang/construction-app:latest

echo "===== 镜像构建和推送完成 ====="
echo "请在Sealos中重新部署应用:"
echo "kubectl rollout restart deployment/gybang1-release-lazgll -n ns-jrnsq1vz" 