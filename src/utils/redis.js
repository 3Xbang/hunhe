/**
 * Redis工具
 */
const redis = require('redis');
const { promisify } = require('util');
const { AppError } = require('./appError');

// 创建Redis客户端
const redisClient = process.env.REDIS_URL ? 
  redis.createClient({
    url: process.env.REDIS_URL,
  }) : 
  redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0
  });

// 错误处理
redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

// 创建 Mock Redis 客户端用于开发环境
const mockRedisClient = {
  cache: {},
  getAsync: async (key) => {
    return mockRedisClient.cache[key] || null;
  },
  setAsync: async (key, value, mode, duration) => {
    mockRedisClient.cache[key] = value;
    return 'OK';
  },
  delAsync: async (key) => {
    delete mockRedisClient.cache[key];
    return 1;
  },
  expireAsync: async (key, seconds) => {
    return 1;
  }
};

// 选择使用真实Redis或Mock Redis
const client = process.env.NODE_ENV === 'development' && !process.env.REDIS_URL ? 
  mockRedisClient : 
  {
    getAsync: promisify(redisClient.get).bind(redisClient),
    setAsync: promisify(redisClient.set).bind(redisClient),
    delAsync: promisify(redisClient.del).bind(redisClient),
    expireAsync: promisify(redisClient.expire).bind(redisClient)
  };

// 封装Redis操作
exports.redis = {
  /**
   * 获取缓存
   * @param {String} key - 缓存键
   * @returns {Promise<String>} 缓存值
   */
  async get(key) {
    try {
      return await client.getAsync(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  /**
   * 设置缓存
   * @param {String} key - 缓存键
   * @param {String} value - 缓存值
   * @param {Number} expiry - 过期时间(秒)
   * @returns {Promise<String>} 操作结果
   */
  async set(key, value, expiry = 3600) {
    try {
      const result = await client.setAsync(key, value, 'EX', expiry);
      return result;
    } catch (error) {
      console.error('Redis set error:', error);
      return null;
    }
  },

  /**
   * 删除缓存
   * @param {String} key - 缓存键
   * @returns {Promise<Number>} 删除的键数量
   */
  async del(key) {
    try {
      return await client.delAsync(key);
    } catch (error) {
      console.error('Redis del error:', error);
      return 0;
    }
  },

  /**
   * 设置过期时间
   * @param {String} key - 缓存键
   * @param {Number} seconds - 过期时间(秒)
   * @returns {Promise<Number>} 操作结果
   */
  async expire(key, seconds) {
    try {
      return await client.expireAsync(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
      return 0;
    }
  }
}; 