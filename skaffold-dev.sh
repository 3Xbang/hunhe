#!/bin/bash

echo "===== 启动 Skaffold 开发环境 ====="

# 检查skaffold是否已安装
if ! command -v skaffold &> /dev/null; then
    echo "Skaffold未安装，请先安装Skaffold"
    echo "可以运行 ./install-skaffold.sh 安装"
    exit 1
fi

# 设置命名空间
NAMESPACE="construction"

# 检查命名空间是否存在，不存在则创建
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "创建命名空间 $NAMESPACE..."
    kubectl apply -f kubernetes/namespace.yaml
fi

# 检查密钥是否已创建
if ! kubectl get secret construction-secrets -n $NAMESPACE &> /dev/null; then
    echo "警告: 未找到'construction-secrets'密钥"
    echo "请确保密钥已经创建，否则应用将无法连接数据库"
    echo "可以使用模板创建密钥: kubectl apply -f kubernetes/secret.yaml -n $NAMESPACE"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 1
    fi
fi

# 开始Skaffold开发模式
echo "启动Skaffold开发环境..."
echo "注意: 这将在后台构建容器并部署到Kubernetes集群"
echo "您可以直接编辑代码，Skaffold将自动同步更改"
echo "要停止开发环境，请按 Ctrl+C"
echo ""
echo "等待应用启动中..."

skaffold dev --namespace $NAMESPACE --port-forward 