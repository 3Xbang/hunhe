/**
 * 数据库连接测试
 */
require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const dns = require('dns').promises;

const testConnection = async () => {
  try {
    logger.info('开始数据库连接测试...');

    // 1. DNS解析测试
    logger.info('正在进行DNS解析测试...');
    try {
      const dnsResult = await dns.lookup('gbang-3-mongodb-0.gbang-3-mongodb.ns-jrnsq1vz.svc');
      logger.info(`DNS解析结果: ${JSON.stringify(dnsResult)}`);
    } catch (dnsError) {
      logger.error('DNS解析失败:', dnsError);
    }

    // 2. 尝试连接
    logger.info('正在尝试连接到数据库...');
    const uri = 'mongodb://root:rqkvs8kn@gbang-3-mongodb-0.gbang-3-mongodb.ns-jrnsq1vz.svc:27017/construction_management?authSource=admin';
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      family: 4
    });

    // 3. 连接成功，获取服务器信息
    logger.info('数据库连接成功！');
    logger.info(`连接到的数据库: ${conn.connection.name}`);
    logger.info(`数据库主机: ${conn.connection.host}`);
    logger.info(`数据库端口: ${conn.connection.port}`);

    // 4. 测试数据库操作
    try {
      const adminDb = conn.connection.db.admin();
      const serverInfo = await adminDb.serverStatus();
      logger.info(`MongoDB 版本: ${serverInfo.version}`);
      logger.info(`连接数: ${serverInfo.connections.current}`);
    } catch (dbError) {
      logger.error('数据库操作测试失败:', dbError);
    }

    // 5. 关闭连接
    await mongoose.connection.close();
    logger.info('数据库连接已正常关闭');
    
    return true;
  } catch (error) {
    logger.error('数据库连接测试失败:', error);
    if (error.name === 'MongoServerSelectionError') {
      logger.error('服务器选择错误，可能的原因：');
      logger.error('1. 服务器未运行');
      logger.error('2. 网络连接问题');
      logger.error('3. 认证失败');
    }
    return false;
  } finally {
    process.exit();
  }
};

test
