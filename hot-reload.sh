#!/bin/bash

echo "===== 设置开发环境热重载 ====="

# 配置变量
NAMESPACE="construction"
DEV_POD_NAME="construction-app-dev"
LOCAL_CODE_PATH="$(pwd)"  # 当前目录，假设是项目根目录

# 检查开发环境是否已经部署
if ! kubectl get deployment $DEV_POD_NAME -n $NAMESPACE &> /dev/null; then
    echo "创建开发环境部署..."
    # 替换开发配置中的代码路径
    sed "s|/path/to/your/code|$LOCAL_CODE_PATH|g" kubernetes/development.yaml > kubernetes/development_temp.yaml
    kubectl apply -f kubernetes/development_temp.yaml -n $NAMESPACE
    rm kubernetes/development_temp.yaml
else
    echo "开发环境已存在"
fi

# 等待Pod运行
echo "等待Pod准备就绪..."
kubectl wait --for=condition=ready pod -l app=construction-app-dev -n $NAMESPACE --timeout=120s

# 获取Pod名称
POD=$(kubectl get pods -l app=construction-app-dev -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POD" ]; then
    echo "错误: 无法获取开发Pod名称"
    exit 1
fi

echo "开发Pod: $POD 已就绪"
echo "您现在可以直接编辑本地代码，应用会自动重新加载"
echo "查看应用日志..."

# 查看应用日志
kubectl logs -f $POD -n $NAMESPACE

echo "===== 热重载开发环境已停止 =====" 