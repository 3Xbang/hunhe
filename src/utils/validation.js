/**
 * 通用验证工具
 */
const { AppError } = require('./appError');

/**
 * 验证请求数据
 * @param {Object} schema - Joi验证模式
 * @param {String} property - 请求属性 (body, params, query)
 * @returns {Function} Express中间件
 */
exports.validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return next(new AppError(400, '验证失败', { errors: errorDetails }));
    }

    // 替换请求中的数据为验证后的数据
    req[property] = value;
    next();
  };
}; 