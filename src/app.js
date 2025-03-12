/**
 * 应用程序入口文件
 */
console.log('启动简化版应用程序...');

// 导入依赖
console.log('导入依赖...');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// 创建日志目录
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 日志配置
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'), 
  { flags: 'a' }
);

// 加载环境变量
require('dotenv').config();
console.log('环境变量加载成功');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI存在:', !!process.env.MONGODB_URI);

// 创建Express应用
const app = express();
console.log('Express应用创建成功');

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 根据环境配置不同的日志格式
if (process.env.NODE_ENV === 'production') {
  // 生产环境使用combined格式并写入文件
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // 开发环境使用dev格式并输出到控制台
  app.use(morgan('dev'));
}

console.log('中间件配置成功');

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('静态文件配置成功');

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: '服务器运行正常',
    time: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? '已连接' : '未连接'
  });
});

// 简单API端点
app.get('/api/info', (req, res) => {
  res.json({
    name: '建筑管理系统',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    time: new Date()
  });
});

console.log('健康检查路由配置成功');

// 添加404处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `找不到路径: ${req.originalUrl}`
  });
});
console.log('404处理配置成功');

// 添加错误处理
app.use((err, req, res, next) => {
  // 记录错误到日志
  console.error('应用错误:', err);
  
  // 不暴露敏感的错误信息给客户端
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;
  
  res.status(statusCode).json({
    status: 'error',
    message: errorMessage
  });
});
console.log('错误处理配置成功');

// 连接MongoDB并启动服务器
async function startServer() {
  try {
    console.log('尝试连接MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('MongoDB连接成功');
  } catch (err) {
    console.error('MongoDB连接失败:', err.message);
    // 即使MongoDB连接失败，也继续启动服务器
  }
  
  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    console.log(`服务器运行在 ${HOST}:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log(`API信息: http://localhost:${PORT}/api/info`);
    console.log(`MongoDB状态: ${mongoose.connection.readyState === 1 ? '已连接' : '未连接'}`);
    console.log(`环境: ${process.env.NODE_ENV}`);
  });
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 在生产环境，可以发送告警邮件或通知
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 启动服务器
startServer().catch(err => {
  console.error('服务器启动失败:', err.message);
}); 