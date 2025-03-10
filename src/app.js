/**
 * 应用程序入口文件
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const serverConfig = require('./config/server');
const logger = require('./utils/logger');

// 创建Express应用
const app = express();

// 基础中间件
app.use(helmet()); // 安全中间件
app.use(cors(serverConfig.cors)); // CORS配置
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 导入项目相关路由
const projectRoutes = require('./routes/project.routes');
const milestoneRoutes = require('./routes/milestone.routes');
const riskRoutes = require('./routes/risk.routes');
const resourceRoutes = require('./routes/resource.routes');
const costRoutes = require('./routes/cost.routes');
const equipmentRoutes = require('./routes/equipment.routes');

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 注册项目管理相关路由
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects/:projectId/milestones', milestoneRoutes);
app.use('/api/v1/projects/:projectId/risks', riskRoutes);
app.use('/api/v1/projects/:projectId/resources', resourceRoutes);
app.use('/api/v1/projects/:projectId/costs', costRoutes);
app.use('/api/v1/equipments', equipmentRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 启动服务器
    app.listen(serverConfig.port, () => {
      logger.info(`服务器在端口 ${serverConfig.port} 上运行`);
      logger.info(`环境: ${serverConfig.env}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 