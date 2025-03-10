/**
 * 基础验证器
 */
const { validationResult } = require('express-validator');

/**
 * 验证中间件
 * @param {Array} validations - 验证规则数组
 * @returns {Function} Express中间件
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // 执行所有验证
    await Promise.all(validations.map(validation => validation.run(req)));

    // 获取验证结果
    const errors = validationResult(req);
    
    // 如果有错误，返回400状态码和错误信息
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    // 验证通过，继续下一个中间件
    next();
  };
}; 