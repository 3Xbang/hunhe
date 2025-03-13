#!/bin/bash

echo "===== 创建Sealos特定的入口点文件 ====="

# 1. 创建一个适用于Sealos的entrypoint.sh文件
cat > Dockerfile.entrypoint << EOF
FROM node:18-alpine as builder

# 创建工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 第二阶段构建更小的生产镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装调试工具
RUN apk add --no-cache curl iputils busybox-extras mongodb-tools

# 从构建阶段复制node_modules
COPY --from=builder /app/node_modules ./node_modules

# 只复制必要的代码和配置文件
COPY src/ ./src/
COPY .env.production ./.env
COPY package.json ./

# 创建日志目录并设置权限
RUN mkdir -p logs && chmod 777 logs

# 为Sealos环境准备目录和入口点脚本
RUN mkdir -p /home/devbox/project && \\
    echo '#!/bin/bash' > /home/devbox/project/entrypoint.sh && \\
    echo 'echo "启动应用程序..."' >> /home/devbox/project/entrypoint.sh && \\
    echo 'cd /app' >> /home/devbox/project/entrypoint.sh && \\
    echo 'exec node src/app.js' >> /home/devbox/project/entrypoint.sh && \\
    chmod +x /home/devbox/project/entrypoint.sh && \\
    ln -sf /app/src /home/devbox/project/src && \\
    ln -sf /app/node_modules /home/devbox/project/node_modules

# 使用非root用户运行应用
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app /home/devbox/project
USER appuser

# 设置Node.js内存限制
ENV NODE_OPTIONS="--max-old-space-size=300"

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用 - 这里的CMD不重要，因为Sealos会使用高级配置中指定的命令
CMD ["/home/devbox/project/entrypoint.sh"]
EOF

echo "Dockerfile.entrypoint 创建完成"

# 2. 构建并推送镜像
echo "构建特定于Sealos的Docker镜像..."
docker build -f Dockerfile.entrypoint -t docker.io/3xbang/construction-app:entrypoint-$(date +%Y%m%d) -t docker.io/3xbang/construction-app:latest .

echo "推送镜像到仓库..."
docker push docker.io/3xbang/construction-app:entrypoint-$(date +%Y%m%d)
docker push docker.io/3xbang/construction-app:latest

echo "===== Sealos特定入口点文件创建完成 ====="
echo "请在Sealos仪表板上执行以下操作："
echo "1. 找到您的部署 'gybang1-release-lazgll'"
echo "2. 执行 'kubectl rollout restart deployment/gybang1-release-lazgll -n ns-jrnsq1vz'"
echo "3. 观察新的容器日志" 