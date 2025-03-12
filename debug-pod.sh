#!/bin/bash

# 设置变量
POD_NAME="gybang1-release-lazgll-bbbd4fcd4-wkmtc"
NAMESPACE="ns-jrnsq1vz"

echo "===== 容器调试工具 ====="

# 收集Pod状态信息
echo "正在收集Pod状态信息..."
kubectl get pod $POD_NAME -n $NAMESPACE -o wide

# 收集Pod详细信息
echo -e "\n===== Pod详细信息 ====="
kubectl describe pod $POD_NAME -n $NAMESPACE

# 获取容器日志
echo -e "\n===== 容器日志 ====="
kubectl logs $POD_NAME -n $NAMESPACE --previous

# 检查MongoDB连接
echo -e "\n===== 检查MongoDB连接 ====="
kubectl exec -it $POD_NAME -n $NAMESPACE -- mongo mongodb://root:rqkvs8kn@gbang-3-mongodb.ns-jrnsq1vz.svc:27017/construction_management?authSource=admin --eval "db.stats()" || echo "无法连接到MongoDB"

# 导出环境变量
echo -e "\n===== 环境变量 ====="
kubectl exec -it $POD_NAME -n $NAMESPACE -- env | sort || echo "无法获取环境变量"

echo -e "\n===== 调试完成 ====="
echo "如果无法执行上述命令，请尝试使用Sealos Dashboard查看日志" 