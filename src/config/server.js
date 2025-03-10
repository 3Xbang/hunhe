/**
 * 服务器配置文件
 */
const config = {
  // 服务器端口配置
  port: process.env.PORT || 3000,
  
  // 环境配置
  env: process.env.NODE_ENV || 'development',
  
  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // 安全配置
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 限制每个IP 15分钟内最多100个请求
    }
  }
};

module.exports = config; 