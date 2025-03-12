/**
 * 文档管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('./validate');

/**
 * 创建文档验证
 */
exports.validateCreateDocument = validate([
  body('title')
    .notEmpty()
    .withMessage('文档标题不能为空')
    .isLength({ max: 200 })
    .withMessage('文档标题不能超过200个字符'),

  body('type')
    .notEmpty()
    .withMessage('文档类型不能为空')
    .isIn(['contract', 'drawing', 'specification', 'report', 'minutes', 'approval', 'other'])
    .withMessage('无效的文档类型'),

  body('project')
    .notEmpty()
    .withMessage('所属项目不能为空')
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('文档描述不能超过1000个字符'),

  body('version')
    .optional()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('版本号格式不正确（例：1.0.0）'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组格式'),

  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('标签长度必须在1-50个字符之间'),

  body('accessLevel')
    .optional()
    .isIn(['public', 'internal', 'confidential', 'restricted'])
    .withMessage('无效的访问权限级别'),

  body('authorizedUsers')
    .optional()
    .isArray()
    .withMessage('授权用户必须是数组格式'),

  body('authorizedUsers.*.user')
    .optional()
    .isMongoId()
    .withMessage('用户ID格式不正确'),

  body('authorizedUsers.*.permissions')
    .optional()
    .isArray()
    .withMessage('权限必须是数组格式'),

  body('authorizedUsers.*.permissions.*')
    .optional()
    .isIn(['read', 'write', 'delete', 'share'])
    .withMessage('无效的权限类型'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('元数据必须是对象格式'),

  body('metadata.author')
    .optional()
    .isLength({ max: 100 })
    .withMessage('作者名称不能超过100个字符'),

  body('metadata.department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('部门名称不能超过100个字符'),

  body('metadata.documentDate')
    .optional()
    .isISO8601()
    .withMessage('文档日期格式不正确'),

  body('metadata.expiryDate')
    .optional()
    .isISO8601()
    .withMessage('过期日期格式不正确'),

  body('metadata.keywords')
    .optional()
    .isArray()
    .withMessage('关键词必须是数组格式'),

  body('metadata.keywords.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('关键词长度必须在1-50个字符之间')
]);

/**
 * 更新文档验证
 */
exports.validateUpdateDocument = validate([
  param('id')
    .isMongoId()
    .withMessage('文档ID格式不正确'),

  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('文档标题不能超过200个字符'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('文档描述不能超过1000个字符'),

  body('version')
    .optional()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('版本号格式不正确（例：1.0.0）'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组格式'),

  body('accessLevel')
    .optional()
    .isIn(['public', 'internal', 'confidential', 'restricted'])
    .withMessage('无效的访问权限级别'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('元数据必须是对象格式')
]);

/**
 * 更新文档状态验证
 */
exports.validateUpdateDocumentStatus = validate([
  param('id')
    .isMongoId()
    .withMessage('文档ID格式不正确'),

  body('status')
    .notEmpty()
    .withMessage('状态不能为空')
    .isIn(['draft', 'pending', 'approved', 'rejected', 'archived'])
    .withMessage('无效的状态值'),

  body('comments')
    .optional()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

/**
 * 更新文档权限验证
 */
exports.validateUpdateDocumentPermissions = validate([
  param('id')
    .isMongoId()
    .withMessage('文档ID格式不正确'),

  body('accessLevel')
    .optional()
    .isIn(['public', 'internal', 'confidential', 'restricted'])
    .withMessage('无效的访问权限级别'),

  body('authorizedUsers')
    .optional()
    .isArray()
    .withMessage('授权用户必须是数组格式'),

  body('authorizedUsers.*.user')
    .optional()
    .isMongoId()
    .withMessage('用户ID格式不正确'),

  body('authorizedUsers.*.permissions')
    .optional()
    .isArray()
    .withMessage('权限必须是数组格式'),

  body('authorizedUsers.*.permissions.*')
    .optional()
    .isIn(['read', 'write', 'delete', 'share'])
    .withMessage('无效的权限类型')
]);

/**
 * 查询文档列表验证
 */
exports.validateQueryDocuments = validate([
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须大于0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),

  query('project')
    .optional()
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  query('type')
    .optional()
    .isIn(['contract', 'drawing', 'specification', 'report', 'minutes', 'approval', 'other'])
    .withMessage('无效的文档类型'),

  query('status')
    .optional()
    .isIn(['draft', 'pending', 'approved', 'rejected', 'archived'])
    .withMessage('无效的状态值'),

  query('accessLevel')
    .optional()
    .isIn(['public', 'internal', 'confidential', 'restricted'])
    .withMessage('无效的访问权限级别'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'title', '-title', 'type', '-type'])
    .withMessage('无效的排序字段')
]);

/**
 * 添加文档版本验证
 */
exports.validateAddDocumentVersion = validate([
  param('id')
    .isMongoId()
    .withMessage('文档ID格式不正确'),

  body('version')
    .notEmpty()
    .withMessage('版本号不能为空')
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('版本号格式不正确（例：1.0.0）'),

  body('changes')
    .notEmpty()
    .withMessage('变更说明不能为空')
    .isLength({ max: 1000 })
    .withMessage('变更说明不能超过1000个字符')
]);

/**
 * 文档统计验证
 */
exports.validateDocumentStats = validate([
  query('project')
    .optional()
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确')
]);

/**
 * 文档搜索验证
 */
exports.validateSearchDocuments = validate([
  query('keyword')
    .optional()
    .isLength({ min: 2 })
    .withMessage('搜索关键词至少2个字符'),

  query('type')
    .optional()
    .isIn(['contract', 'drawing', 'specification', 'report', 'minutes', 'approval', 'other'])
    .withMessage('无效的文档类型'),

  query('status')
    .optional()
    .isIn(['draft', 'pending', 'approved', 'rejected', 'archived'])
    .withMessage('无效的状态值'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须大于0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间')
]); 