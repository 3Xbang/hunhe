/**
 * 自定义应用程序错误类
 * 用于创建可预测的业务逻辑错误
 */
class AppError extends Error {
  /**
   * 创建自定义应用错误实例
   * @param {string} message - 错误消息
   * @param {number} statusCode - HTTP状态码
   * @param {boolean} isOperational - 是否为可预期的操作错误，默认为true
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建400错误（Bad Request）
 * @param {string} message 错误消息
 * @returns {AppError} 错误对象
 */
const badRequestError = (message = '请求参数无效') => {
  return new AppError(message, 400);
};

/**
 * 创建401错误（Unauthorized）
 * @param {string} message 错误消息
 * @returns {AppError} 错误对象
 */
const unauthorizedError = (message = '未授权访问') => {
  return new AppError(message, 401);
};

/**
 * 创建403错误（Forbidden）
 * @param {string} message 错误消息
 * @returns {AppError} 错误对象
 */
const forbiddenError = (message = '禁止访问') => {
  return new AppError(message, 403);
};

/**
 * 创建404错误（Not Found）
 * @param {string} message 错误消息
 * @returns {AppError} 错误对象
 */
const notFoundError = (message = '资源不存在') => {
  return new AppError(message, 404);
};

/**
 * 创建409错误（Conflict）
 * @param {string} message 错误消息
 * @returns {AppError} 错误对象
 */
const conflictError = (message = '数据冲突') => {
  return new AppError(message, 409);
};

/**
 * 创建500错误（Internal Server Error）
 * @param {string} message 错误消息
 * @returns {AppError} 错误对象
 */
const internalServerError = (message = '服务器内部错误') => {
  return new AppError(message, 500, false);
};

module.exports = {
  AppError,
  badRequestError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError,
  internalServerError
}; 