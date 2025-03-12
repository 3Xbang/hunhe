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

# 使用非root用户运行应用
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
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

# 启动应用
CMD ["node", "--trace-warnings", "src/app.js"] 