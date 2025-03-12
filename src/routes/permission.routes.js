/**
 * 权限管理路由
 * src/routes/permission.routes.js
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const permissionProvider = require('../providers/permission.provider');
const {
  validateCreatePermission,
  validateCreateRole,
  validateAssignUserRole,
  validateBatchAssignPermissions,
  validateCreatePermissionTemplate,
  validateApplyTemplate,
  validateDataScopeRule
} = require('../middlewares/validators/permission.validator');
const { AppError } = require('../utils/appError');

// 创建权限
router.post('/permissions',
  authenticate,
  authorize('system:permission:create'),
  validateCreatePermission,
  async (req, res, next) => {
    try {
      const permission = await permissionProvider.createPermission({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json({
        success: true,
        data: permission
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取权限列表
router.get('/permissions',
  authenticate,
  authorize('system:permission:view'),
  async (req, res, next) => {
    try {
      const result = await permissionProvider.getPermissions(req.query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// 创建角色
router.post('/roles',
  authenticate,
  authorize('system:role:create'),
  validateCreateRole,
  async (req, res, next) => {
    try {
      const role = await permissionProvider.createRole({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json({
        success: true,
        data: role
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取角色列表
router.get('/roles',
  authenticate,
  authorize('system:role:view'),
  async (req, res, next) => {
    try {
      const result = await permissionProvider.getRoles(req.query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// 分配用户角色
router.post('/user-roles',
  authenticate,
  authorize('system:user-role:assign'),
  validateAssignUserRole,
  async (req, res, next) => {
    try {
      const userRole = await permissionProvider.assignUserRole({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json({
        success: true,
        data: userRole
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取用户权限
router.get('/user-permissions',
  authenticate,
  async (req, res, next) => {
    try {
      const permissions = await permissionProvider.getUserPermissions(req.user._id);
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取用户权限分配详情
router.get('/users/:userId/permissions',
  authenticate,
  authorize('system:permission:assign'),
  async (req, res, next) => {
    try {
      const result = await permissionProvider.getUserPermissionAssignments(req.params.userId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// 分配用户权限
router.post('/users/:userId/permissions',
  authenticate,
  authorize('system:permission:assign'),
  async (req, res, next) => {
    try {
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions)) {
        throw new AppError(400, '无效的权限数据格式');
      }
      
      const result = await permissionProvider.assignUserPermissions({
        userId: req.params.userId,
        permissions,
        operatorId: req.user._id
      });
      
      res.json({
        success: true,
        data: result,
        message: '权限分配成功'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 批量分配权限
 */
router.post('/batch-assign',
  authenticate,
  authorize('system:permission:batch-assign'),
  validateBatchAssignPermissions,
  async (req, res, next) => {
    try {
      const result = await permissionProvider.batchAssignPermissions({
        userIds: req.body.userIds,
        permissions: req.body.permissions,
        operatorId: req.user._id
      }, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        success: true,
        data: result,
        message: `成功为${result.successful}个用户分配权限，${result.failed}个失败`
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 权限模板管理
 */
// 创建权限模板
router.post('/templates',
  authenticate,
  authorize('system:permission:template-manage'),
  validateCreatePermissionTemplate,
  async (req, res, next) => {
    try {
      const template = await permissionProvider.createPermissionTemplate({
        ...req.body,
        createdBy: req.user._id
      });
      
      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取权限模板列表
router.get('/templates',
  authenticate,
  authorize('system:permission:template-view'),
  async (req, res, next) => {
    try {
      const result = await permissionProvider.getPermissionTemplates(req.query);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// 应用权限模板到用户
router.post('/templates/apply',
  authenticate,
  authorize('system:permission:template-apply'),
  validateApplyTemplate,
  async (req, res, next) => {
    try {
      const result = await permissionProvider.applyTemplateToUsers({
        templateId: req.body.templateId,
        userIds: req.body.userIds,
        operatorId: req.user._id
      }, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        success: true,
        data: result,
        message: `成功将模板"${result.templateName}"应用到${result.successful}个用户，${result.failed}个失败`
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 数据权限规则管理
 */
// 创建数据权限规则
router.post('/data-rules',
  authenticate,
  authorize('system:permission:data-rule-manage'),
  validateDataScopeRule,
  async (req, res, next) => {
    try {
      const rule = await permissionProvider.createDataScopeRule({
        ...req.body,
        createdBy: req.user._id
      });
      
      res.status(201).json({
        success: true,
        data: rule
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取数据权限规则列表
router.get('/data-rules',
  authenticate,
  authorize('system:permission:data-rule-view'),
  async (req, res, next) => {
    try {
      // 此方法需要在权限提供者中实现
      const result = await permissionProvider.getDataScopeRules(req.query);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 权限审计日志
 */
// 获取权限操作日志
router.get('/audit-logs',
  authenticate,
  authorize('system:permission:audit-view'),
  async (req, res, next) => {
    try {
      const result = await permissionProvider.getPermissionAssignmentLogs(req.query);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// 高级权限验证中间件
const enhancedPermission = (permissionCode, module) => {
  return async (req, res, next) => {
    try {
      const hasPermission = await permissionProvider.enhancedPermissionCheck(
        req.user._id,
        permissionCode,
        req.body, // 或req.params等，取决于路由
        module
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

// 导出中间件以供其他路由使用
module.exports.enhancedPermission = enhancedPermission;

module.exports = router; 