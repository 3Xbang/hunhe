#!/bin/bash

echo "===== 安装 Skaffold ====="

# 检查操作系统类型
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux系统
    echo "检测到Linux系统，安装Skaffold..."
    curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
    chmod +x skaffold
    sudo mv skaffold /usr/local/bin/
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS系统
    echo "检测到macOS系统，安装Skaffold..."
    brew install skaffold
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows系统
    echo "检测到Windows系统，请使用以下命令安装Skaffold:"
    echo "1. 使用Chocolatey: choco install skaffold"
    echo "2. 或手动下载: https://storage.googleapis.com/skaffold/releases/latest/skaffold-windows-amd64.exe"
    exit 0
fi

# 检查安装结果
if command -v skaffold &> /dev/null; then
    SKAFFOLD_VERSION=$(skaffold version)
    echo "Skaffold 安装成功: $SKAFFOLD_VERSION"
else
    echo "Skaffold 安装失败，请尝试手动安装"
    exit 1
fi

echo "===== Skaffold 安装完成 =====" 