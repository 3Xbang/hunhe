/**
 * 权限验证中间件
 * src/middlewares/permission.js
 */
const permissionProvider = require('../providers/permission.provider');
const { AppError, unauthorized } = require('../utils/appError');

/**
 * 权限验证中间件
 * @param {string} permissionCode - 权限编码
 * @param {boolean} checkData - 是否检查数据权限
 */
exports.checkPermission = (permissionCode, checkData = false) => {
  return async (req, res, next) => {
    try {
      const hasPermission = await permissionProvider.checkPermission(
        req.user._id,
        permissionCode,
        checkData ? req.body : null
      );

      if (!hasPermission) {
        throw new AppError(403, '没有操作权限');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 多权限验证中间件（或关系）
 * @param {string[]} permissionCodes - 权限编码数组
 */
exports.checkAnyPermission = (permissionCodes) => {
  return async (req, res, next) => {
    try {
      const { permissions } = await permissionProvider.getUserPermissions(req.user._id);
      
      const hasPermission = permissionCodes.some(code => 
        permissions.includes(code)
      );

      if (!hasPermission) {
        throw new AppError(403, '没有操作权限');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 多权限验证中间件（与关系）
 * @param {string[]} permissionCodes - 权限编码数组
 */
exports.checkAllPermissions = (permissionCodes) => {
  return async (req, res, next) => {
    try {
      const { permissions } = await permissionProvider.getUserPermissions(req.user._id);
      
      const hasAllPermissions = permissionCodes.every(code => 
        permissions.includes(code)
      );

      if (!hasAllPermissions) {
        throw new AppError(403, '没有操作权限');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 