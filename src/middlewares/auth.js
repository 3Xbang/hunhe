/**
 * 身份验证中间件
 */
const jwt = require('jsonwebtoken');
const { AppError, unauthorizedError, forbiddenError } = require('../utils/appError');
const { User } = require('../models/user.model');

/**
 * 验证用户身份
 */
const authenticate = async (req, res, next) => {
  try {
    // 检查请求头中是否包含授权信息
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return next(unauthorizedError('未提供访问令牌'));
    }

    // 获取令牌
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return next(unauthorizedError('未提供访问令牌'));
    }

    // 验证令牌
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return next(unauthorizedError('无效的访问令牌'));
    }

    // 查找用户
    const user = await User.findById(decoded.id).select('+permissions');
    if (!user) {
      return next(unauthorizedError('用户不存在'));
    }

    // 检查令牌是否在用户的令牌黑名单中
    if (user.invalidatedTokens && user.invalidatedTokens.includes(token)) {
      return next(unauthorizedError('令牌已失效'));
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 验证用户角色权限
 * @param  {...string} roles 允许的角色列表
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // 检查用户是否通过了身份验证
    if (!req.user) {
      return next(unauthorizedError('请先登录'));
    }

    // 检查用户是否具有所需角色
    if (!roles.includes(req.user.role)) {
      return next(forbiddenError('您没有权限执行此操作'));
    }

    next();
  };
};

/**
 * 验证用户权限
 * @param {string} permission 所需权限
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    // 检查用户是否通过了身份验证
    if (!req.user) {
      return next(unauthorizedError('请先登录'));
    }

    // 检查用户是否具有所需权限
    if (req.user.role === 'admin') {
      // 管理员拥有所有权限
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return next(forbiddenError('您没有权限执行此操作'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  hasPermission
}; 