#!/bin/bash

echo "===== 创建适应性启动文件 ====="

# 1. 在当前目录创建adapter.js文件
cat > adapter.js << EOF
/**
 * 适应性启动文件 - 用于解决路径问题
 */
console.log('启动适应器：正在启动应用...');

// 检测当前路径
const path = require('path');
const fs = require('fs');
const currentDir = process.cwd();

console.log('当前工作目录:', currentDir);

// 可能的源代码路径
const possiblePaths = [
  path.join(currentDir, 'src/app.js'),         // 当前目录下的src/app.js
  path.join('/app', 'src/app.js'),             // /app下的src/app.js
  path.join('/home/devbox/project', 'src/app.js'), // 特定于Sealos的路径
  path.join(currentDir, 'app.js')              // 当前目录下的app.js
];

// 查找可用的应用入口文件
let appPath = null;
for(const testPath of possiblePaths) {
  console.log('检查路径:', testPath);
  if(fs.existsSync(testPath)) {
    appPath = testPath;
    console.log('发现可用的应用入口:', appPath);
    break;
  }
}

if(!appPath) {
  console.error('错误：找不到有效的应用入口文件');
  console.error('已检查的路径:', possiblePaths);
  process.exit(1);
}

// 动态加载应用
console.log('正在加载应用...');
try {
  require(appPath);
  console.log('应用加载成功');
} catch(err) {
  console.error('加载应用失败:', err);
  process.exit(1);
}
EOF

echo "adapter.js 创建完成"

# 2. 创建一个新的Dockerfile
cat > Dockerfile.adaptive << EOF
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
COPY adapter.js ./

# 创建日志目录并设置权限
RUN mkdir -p logs && chmod 777 logs

# 创建多个启动脚本以应对不同环境
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'cd /app && exec node --trace-warnings src/app.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    echo '#!/bin/sh' > /app/adapter-start.sh && \
    echo 'cd /app && exec node adapter.js' >> /app/adapter-start.sh && \
    chmod +x /app/adapter-start.sh

# 为Sealos环境创建特殊的入口点
RUN mkdir -p /home/devbox/project && \
    echo '#!/bin/sh' > /home/devbox/project/app.js && \
    echo 'cd /app && exec node adapter.js' >> /home/devbox/project/app.js && \
    chmod +x /home/devbox/project/app.js && \
    ln -s /app/src /home/devbox/project/src && \
    ln -s /app/node_modules /home/devbox/project/node_modules

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
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用 - 使用适应器启动
CMD ["node", "adapter.js"]
EOF

echo "Dockerfile.adaptive 创建完成"

# 3. 构建并推送新镜像
echo "构建适应性Docker镜像..."
docker build -f Dockerfile.adaptive -t docker.io/3xbang/construction-app:adaptive-$(date +%Y%m%d) -t docker.io/3xbang/construction-app:latest .

echo "推送镜像到仓库..."
docker push docker.io/3xbang/construction-app:adaptive-$(date +%Y%m%d)
docker push docker.io/3xbang/construction-app:latest

echo "===== 适应性启动文件创建完成 ====="
echo "请在Sealos仪表板上执行以下操作："
echo "1. 找到您的部署 'gybang1-release-lazgll'"
echo "2. 执行 'kubectl rollout restart deployment/gybang1-release-lazgll -n ns-jrnsq1vz'"
echo "3. 观察新的容器日志" 