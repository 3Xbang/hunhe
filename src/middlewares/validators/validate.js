/**
 * 基础验证器
 */
const { validationResult } = require('express-validator');
const { badRequestError } = require('../../utils/appError');

/**
 * 通用验证中间件
 * @param {Array} validations - 验证规则数组
 * @returns {Function} Express中间件
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // 执行所有验证
    await Promise.all(validations.map(validation => validation.run(req)));

    // 获取验证结果
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // 格式化错误信息
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    // 抛出错误
    next(badRequestError('验证失败', { errors: formattedErrors }));
  };
}; 