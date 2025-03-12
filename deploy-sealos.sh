#!/bin/bash

echo "===== 开始 Sealos 部署 ====="

# 配置变量
REGISTRY="docker.io/3xbang"
IMAGE_NAME="construction-app"
IMAGE_TAG="$(date +%Y%m%d-%H%M%S)"
NAMESPACE="construction"

# 检查kubectl是否可用
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl 命令未找到，请确保已安装kubectl并配置好Sealos集群访问权限"
    exit 1
fi

# Docker Hub登录
echo "登录到Docker Hub..."
if ! docker info | grep "Username" > /dev/null; then
    echo "请输入Docker Hub凭据"
    docker login
fi

# 确保目录存在
mkdir -p kubernetes

# 检查namespace是否存在，不存在则创建
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "创建命名空间 $NAMESPACE..."
    kubectl apply -f kubernetes/namespace.yaml
fi

# 构建Docker镜像
echo "构建Docker镜像 $REGISTRY/$IMAGE_NAME:$IMAGE_TAG..."
docker build -t $REGISTRY/$IMAGE_NAME:$IMAGE_TAG -t $REGISTRY/$IMAGE_NAME:latest .

# 推送镜像到仓库
echo "推送镜像到仓库..."
docker push $REGISTRY/$IMAGE_NAME:$IMAGE_TAG
docker push $REGISTRY/$IMAGE_NAME:latest

# 替换部署文件中的变量
echo "替换部署文件中的变量..."
sed "s|\${REGISTRY}|$REGISTRY|g" kubernetes/deployment.yaml > kubernetes/deployment_temp.yaml

# 应用Kubernetes配置
echo "应用Kubernetes配置..."
kubectl apply -f kubernetes/configmap.yaml -n $NAMESPACE || echo "Warning: configmap.yaml not found or error applying"
kubectl apply -f kubernetes/secret.yaml -n $NAMESPACE || echo "Error: Failed to apply secret.yaml, please check the file"
kubectl apply -f kubernetes/deployment_temp.yaml -n $NAMESPACE
kubectl apply -f kubernetes/service.yaml -n $NAMESPACE
kubectl apply -f kubernetes/ingress.yaml -n $NAMESPACE

# 清理临时文件
rm -f kubernetes/deployment_temp.yaml

# 等待部署完成
echo "等待部署完成..."
kubectl rollout status deployment/construction-app -n $NAMESPACE

# 检查服务状态
echo "部署状态:"
kubectl get pods,svc,ingress -n $NAMESPACE

echo "===== Sealos 部署完成 ====="
echo "应用应该在几分钟内可用"
echo "您可以通过以下地址访问应用:"
echo "http://construction.ns-jrnsq1vz.svc.cluster.local" 