#!/bin/bash

echo "===== 使用 Skaffold 部署生产环境 ====="

# 检查skaffold是否已安装
if ! command -v skaffold &> /dev/null; then
    echo "Skaffold未安装，请先安装Skaffold"
    echo "可以运行 ./install-skaffold.sh 安装"
    exit 1
fi

# 配置变量
NAMESPACE="construction"
REGISTRY="docker.io/yourusername"  # 替换为您的镜像仓库地址

# 检查命名空间是否存在，不存在则创建
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "创建命名空间 $NAMESPACE..."
    kubectl apply -f kubernetes/namespace.yaml
fi

# 检查密钥是否已创建
if ! kubectl get secret construction-secrets -n $NAMESPACE &> /dev/null; then
    echo "错误: 未找到'construction-secrets'密钥"
    echo "请确保密钥已经创建，否则部署将失败"
    echo "可以使用模板创建密钥: kubectl apply -f kubernetes/secret.yaml -n $NAMESPACE"
    exit 1
fi

# 询问确认
echo "将使用Skaffold部署生产环境版本"
echo "这将构建新镜像并部署到Kubernetes集群"
read -p "是否继续? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 0
fi

# 设置镜像仓库
export IMAGE_REPO=$REGISTRY

# 执行部署
echo "开始部署生产环境..."
skaffold run -p prod --namespace $NAMESPACE

if [ $? -eq 0 ]; then
    echo "===== 生产环境部署成功 ====="
    
    # 显示部署状态
    echo "部署状态:"
    kubectl get pods,svc,ingress -n $NAMESPACE
else
    echo "===== 生产环境部署失败 ====="
    echo "请检查错误日志并解决问题"
fi 