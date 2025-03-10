/**
 * 数据库配置文件
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10
    };

    logger.info('正在连接到数据库...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    logger.info(`MongoDB 连接成功: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB 连接错误:', err);
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
};

module.exports = { connectDB }; 