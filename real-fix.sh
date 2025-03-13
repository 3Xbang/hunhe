#!/bin/bash

echo "===== 基于新日志信息的修复方案 ====="

# 1. 创建更适合的Dockerfile
cat > Dockerfile.realfix << EOF
FROM node:18-alpine

# 这里不要设置WORKDIR，让容器使用默认的/

# 安装基本工具
RUN apk add --no-cache curl iputils busybox-extras mongodb-tools

# 创建必要的目录结构
RUN mkdir -p /home/devbox/project/src \
    && mkdir -p /home/devbox/project/logs \
    && chmod 777 /home/devbox/project/logs

# 复制应用程序文件到正确位置
COPY package*.json /home/devbox/project/
COPY src/ /home/devbox/project/src/
COPY .env.production /home/devbox/project/.env

# 安装依赖项
WORKDIR /home/devbox/project
RUN npm ci --only=production

# 创建启动脚本
RUN echo '#!/bin/bash' > /home/devbox/project/entrypoint.sh && \
    echo 'echo "Starting application from correct directory..."' >> /home/devbox/project/entrypoint.sh && \
    echo 'cd /home/devbox/project' >> /home/devbox/project/entrypoint.sh && \
    echo 'exec node src/app.js' >> /home/devbox/project/entrypoint.sh && \
    chmod +x /home/devbox/project/entrypoint.sh

# 使用非root用户运行应用
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /home/devbox/project
USER appuser

# 设置Node.js内存限制
ENV NODE_OPTIONS="--max-old-space-size=300"

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用 - 使用Sealos期望的入口点
CMD ["/home/devbox/project/entrypoint.sh"]
EOF

echo "Dockerfile.realfix 创建完成"

# 2. 展示Sealos高级配置修改方案
echo "=============================================="
echo "Sealos高级配置修改方案 (更简单)："
echo "=============================================="
echo "1. 保持'运行命令'不变: /bin/bash -c"
echo "2. 修改'命令参数'为: cd /home/devbox/project && node src/app.js"
echo "=============================================="

# 3. 构建和推送镜像方案
echo "如果要构建新的镜像，可以执行:"
echo "--------------------------------------------"
echo "docker build -f Dockerfile.realfix -t docker.io/3xbang/construction-app:realfix-\$(date +%Y%m%d) -t docker.io/3xbang/construction-app:latest ."
echo "docker push docker.io/3xbang/construction-app:realfix-\$(date +%Y%m%d)"
echo "docker push docker.io/3xbang/construction-app:latest"
echo "--------------------------------------------"

echo "===== 修复建议结束 =====" 