#!/bin/bash

echo "===== 开始更新应用 ====="

# 配置变量
REGISTRY="docker.io/yourusername"  # 替换为您的镜像仓库地址
IMAGE_NAME="construction-app"
NAMESPACE="construction"
TAG=$(date +%Y%m%d%H%M%S)

# 检查是否有未提交的更改
if [ -d .git ] && command -v git &> /dev/null; then
    if ! git diff-index --quiet HEAD --; then
        echo "有未提交的代码更改，建议先提交更改"
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "更新已取消"
            exit 1
        fi
    fi
fi

# 构建新镜像
echo "构建新镜像: $REGISTRY/$IMAGE_NAME:$TAG..."
docker build -t $REGISTRY/$IMAGE_NAME:$TAG .
docker tag $REGISTRY/$IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:latest

# 推送镜像到仓库
echo "推送镜像到仓库..."
docker push $REGISTRY/$IMAGE_NAME:$TAG
docker push $REGISTRY/$IMAGE_NAME:latest

# 更新部署
echo "更新Kubernetes部署..."
kubectl set image deployment/construction-app construction-app=$REGISTRY/$IMAGE_NAME:$TAG -n $NAMESPACE

# 等待部署完成
echo "等待部署完成..."
kubectl rollout status deployment/construction-app -n $NAMESPACE

# 检查应用状态
echo "检查应用状态..."
PODS=$(kubectl get pods -l app=construction-app -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
for POD in $PODS; do
    echo "检查Pod: $POD"
    kubectl exec $POD -n $NAMESPACE -- curl -s http://localhost:3000/health || echo "无法访问健康检查端点"
done

echo "===== 应用更新完成 ====="
echo "新版本: $TAG" 