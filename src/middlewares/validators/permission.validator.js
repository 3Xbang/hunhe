/**
 * 权限管理验证器
 * src/middlewares/validators/permission.validator.js
 */
const Joi = require('joi');
const { validateRequest } = require('../../utils/validation');
const { ObjectId } = require('mongoose').Types;

/**
 * 验证创建权限请求
 */
const validateCreatePermission = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().trim().regex(/^[a-z][a-z0-9_:]*$/).required()
      .messages({
        'string.empty': '权限编码不能为空',
        'string.pattern.base': '权限编码只能包含小写字母、数字、下划线和冒号，且必须以字母开头',
        'any.required': '权限编码是必填项'
      }),

    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': '权限名称不能为空',
        'string.min': '权限名称至少需要2个字符',
        'string.max': '权限名称不能超过50个字符',
        'any.required': '权限名称是必填项'
      }),

    description: Joi.string().trim().max(200)
      .messages({
        'string.max': '权限描述不能超过200个字符'
      }),

    module: Joi.string().valid(
      'system', 'user', 'project', 'task', 'document', 
      'knowledge', 'notification', 'attendance', 'finance', 
      'contract', 'supplier', 'material', 'equipment', 
      'quality', 'security'
    ).required()
      .messages({
        'any.only': '无效的模块名称',
        'any.required': '模块名称是必填项'
      }),

    type: Joi.string().valid('menu', 'operation', 'data').required()
      .messages({
        'any.only': '权限类型必须是 menu、operation 或 data',
        'any.required': '权限类型是必填项'
      }),

    status: Joi.boolean()
  });

  validateRequest(req, next, schema);
};

/**
 * 验证创建角色请求
 */
const validateCreateRole = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().trim().regex(/^[A-Z][A-Z0-9_]*$/).required()
      .messages({
        'string.empty': '角色编码不能为空',
        'string.pattern.base': '角色编码只能包含大写字母、数字和下划线，且必须以字母开头',
        'any.required': '角色编码是必填项'
      }),

    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': '角色名称不能为空',
        'string.min': '角色名称至少需要2个字符',
        'string.max': '角色名称不能超过50个字符',
        'any.required': '角色名称是必填项'
      }),

    description: Joi.string().trim().max(200)
      .messages({
        'string.max': '角色描述不能超过200个字符'
      }),

    permissions: Joi.array().items(
      Joi.object({
        permission: Joi.string().custom((value, helpers) => {
          if (!ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }).required()
          .messages({
            'any.required': '权限ID是必填项',
            'any.invalid': '无效的权限ID格式'
          }),
        dataScope: Joi.string().valid('all', 'department', 'personal').default('all')
          .messages({
            'any.only': '数据范围必须是 all、department 或 personal'
          })
      })
    ).min(1).required()
      .messages({
        'array.min': '至少需要分配一个权限',
        'any.required': '权限列表是必填项'
      }),

    status: Joi.boolean(),
    isSystem: Joi.boolean()
  });

  validateRequest(req, next, schema);
};

/**
 * 验证分配用户角色请求
 */
const validateAssignUserRole = (req, res, next) => {
  const schema = Joi.object({
    user: Joi.string().custom((value, helpers) => {
      if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
      .messages({
        'any.required': '用户ID是必填项',
        'any.invalid': '无效的用户ID格式'
      }),

    role: Joi.string().custom((value, helpers) => {
      if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
      .messages({
        'any.required': '角色ID是必填项',
        'any.invalid': '无效的角色ID格式'
      }),

    department: Joi.string().custom((value, helpers) => {
      if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
      .messages({
        'any.invalid': '无效的部门ID格式'
      }),

    status: Joi.boolean()
  });

  validateRequest(req, next, schema);
};

/**
 * 验证批量分配权限请求
 */
const validateBatchAssignPermissions = (req, res, next) => {
  const schema = Joi.object({
    userIds: Joi.array().items(
      Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    ).min(1).required()
      .messages({
        'array.min': '至少需要选择一个用户',
        'any.required': '用户列表是必填项'
      }),
    
    permissions: Joi.array().items(
      Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    ).min(1).required()
      .messages({
        'array.min': '至少需要选择一个权限',
        'any.required': '权限列表是必填项'
      })
  });
  
  validateRequest(req, next, schema);
};

/**
 * 验证创建权限模板请求
 */
const validateCreatePermissionTemplate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': '模板名称不能为空',
        'string.min': '模板名称至少需要2个字符',
        'string.max': '模板名称不能超过50个字符',
        'any.required': '模板名称是必填项'
      }),
    
    description: Joi.string().trim().max(200)
      .messages({
        'string.max': '模板描述不能超过200个字符'
      }),
    
    permissions: Joi.array().items(
      Joi.object({
        permission: Joi.string().custom((value, helpers) => {
          if (!ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }).required()
          .messages({
            'any.required': '权限ID是必填项',
            'any.invalid': '无效的权限ID格式'
          }),
        dataScope: Joi.string().valid('all', 'department', 'personal', 'custom').default('all')
          .messages({
            'any.only': '数据范围必须是 all、department、personal 或 custom'
          })
      })
    ).min(1).required()
      .messages({
        'array.min': '至少需要包含一个权限',
        'any.required': '权限列表是必填项'
      }),
    
    isDefault: Joi.boolean().default(false),
    status: Joi.boolean().default(true)
  });
  
  validateRequest(req, next, schema);
};

/**
 * 验证应用权限模板请求
 */
const validateApplyTemplate = (req, res, next) => {
  const schema = Joi.object({
    templateId: Joi.string().custom((value, helpers) => {
      if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
      .messages({
        'any.required': '模板ID是必填项',
        'any.invalid': '无效的模板ID格式'
      }),
    
    userIds: Joi.array().items(
      Joi.string().custom((value, helpers) => {
        if (!ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    ).min(1).required()
      .messages({
        'array.min': '至少需要选择一个用户',
        'any.required': '用户列表是必填项'
      })
  });
  
  validateRequest(req, next, schema);
};

/**
 * 验证创建数据范围规则请求
 */
const validateDataScopeRule = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': '规则名称不能为空',
        'string.min': '规则名称至少需要2个字符',
        'string.max': '规则名称不能超过50个字符',
        'any.required': '规则名称是必填项'
      }),
    
    description: Joi.string().trim().max(200)
      .messages({
        'string.max': '规则描述不能超过200个字符'
      }),
    
    permission: Joi.string().custom((value, helpers) => {
      if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).required()
      .messages({
        'any.required': '权限ID是必填项',
        'any.invalid': '无效的权限ID格式'
      }),
    
    module: Joi.string().required()
      .messages({
        'string.empty': '模块不能为空',
        'any.required': '模块是必填项'
      }),
    
    ruleType: Joi.string().valid('department', 'user', 'role', 'field', 'condition').required()
      .messages({
        'any.only': '规则类型必须是 department、user、role、field 或 condition',
        'any.required': '规则类型是必填项'
      }),
    
    ruleConditions: Joi.object().required()
      .messages({
        'any.required': '规则条件是必填项'
      }),
    
    applyTo: Joi.array().items(
      Joi.object({
        user: Joi.string().custom((value, helpers) => {
          if (!ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }).required()
          .messages({
            'any.required': '用户ID是必填项',
            'any.invalid': '无效的用户ID格式'
          })
      })
    ).min(1).required()
      .messages({
        'array.min': '至少需要应用到一个用户',
        'any.required': '应用用户列表是必填项'
      }),
    
    status: Joi.boolean().default(true)
  });
  
  validateRequest(req, next, schema);
};

module.exports = {
  validateCreatePermission,
  validateCreateRole,
  validateAssignUserRole,
  validateBatchAssignPermissions,
  validateCreatePermissionTemplate,
  validateApplyTemplate,
  validateDataScopeRule
}; 