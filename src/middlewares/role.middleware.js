/**
 * 角色中间件 - 验证用户角色
 */
const { AppError, unauthorizedError, forbiddenError } = require('../utils/appError');

/**
 * 检查用户是否拥有指定的角色
 * @param {...string} roles - 允许的角色列表
 * @returns {function} Express中间件
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    // 确保用户已通过身份验证并有角色信息
    if (!req.user || !req.user.role) {
      return next(unauthorizedError('未授权访问，请先登录'));
    }

    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      return next(
        forbiddenError(`角色 ${req.user.role} 没有执行此操作的权限`)
      );
    }

    // 用户具有足够的权限，继续处理请求
    next();
  };
};

module.exports = {
  checkRole
}; 