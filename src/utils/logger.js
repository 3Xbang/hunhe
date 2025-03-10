/**
 * 日志工具
 */
const winston = require('winston');
const path = require('path');

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// 根据环境选择日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// 定义日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// 定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 定义日志传输目标
const transports = [
  // 控制台输出
  new winston.transports.Console(),
  
  // 错误日志文件
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error'
  }),
  
  // 所有日志文件
  new winston.transports.File({
    filename: path.join('logs', 'combined.log')
  })
];

// 创建日志实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

module.exports = logger; 