#!/bin/bash

echo "===== 开始 Sealos 部署 ====="

# 配置变量
REGISTRY="docker.io/yourusername"  # 替换为您的镜像仓库地址
IMAGE_NAME="construction-app"
IMAGE_TAG="latest"
NAMESPACE="construction"

# 检查kubectl是否可用
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl 命令未找到，请确保已安装kubectl并配置好Sealos集群访问权限"
    exit 1
fi

# 创建目录
mkdir -p kubernetes

# 检查namespace是否存在，不存在则创建
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "创建命名空间 $NAMESPACE..."
    kubectl apply -f kubernetes/namespace.yaml
fi

# 构建Docker镜像
echo "构建Docker镜像..."
docker build -t $REGISTRY/$IMAGE_NAME:$IMAGE_TAG .

# 推送镜像到仓库
echo "推送镜像到仓库..."
docker push $REGISTRY/$IMAGE_NAME:$IMAGE_TAG

# 创建或更新密文
echo "请创建包含必要密钥的secrets文件..."
echo "提示: 可以使用 kubernetes/secret.example.yaml 作为模板"
read -p "密钥文件是否已准备好? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 替换部署文件中的变量
    echo "替换部署文件中的变量..."
    sed "s|\${REGISTRY}|$REGISTRY|g" kubernetes/deployment.yaml > kubernetes/deployment_temp.yaml
    
    # 应用Kubernetes配置
    echo "应用Kubernetes配置..."
    kubectl apply -f kubernetes/configmap.yaml -n $NAMESPACE
    echo "请手动应用secret文件:"
    echo "kubectl apply -f path/to/your/secret.yaml -n $NAMESPACE"
    read -p "确认secret已应用? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl apply -f kubernetes/deployment_temp.yaml -n $NAMESPACE
        kubectl apply -f kubernetes/service.yaml -n $NAMESPACE
        kubectl apply -f kubernetes/ingress.yaml -n $NAMESPACE
        
        # 清理临时文件
        rm kubernetes/deployment_temp.yaml
        
        # 等待部署完成
        echo "等待部署完成..."
        kubectl rollout status deployment/construction-app -n $NAMESPACE
        
        # 检查服务状态
        echo "部署状态:"
        kubectl get pods,svc,ingress -n $NAMESPACE
    else
        echo "部署已取消，请先应用密钥文件"
        exit 1
    fi
else
    echo "部署已取消，请先准备密钥文件"
    exit 1
fi

echo "===== Sealos 部署完成 ====="
echo "现在您可以通过配置的域名访问应用: http://construction.example.com" 