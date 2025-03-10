/**
 * 项目管理验证器
 */
const { body, query } = require('express-validator');
const { validate } = require('./validate');

// 创建项目验证
exports.validateCreateProject = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('项目名称不能为空')
    .isLength({ max: 100 })
    .withMessage('项目名称不能超过100个字符'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('项目编号不能为空')
    .isLength({ max: 50 })
    .withMessage('项目编号不能超过50个字符'),

  body('type')
    .notEmpty()
    .withMessage('项目类型不能为空')
    .isIn(['construction', 'renovation', 'maintenance', 'design', 'consulting'])
    .withMessage('无效的项目类型'),

  body('client')
    .notEmpty()
    .withMessage('客户ID不能为空')
    .isMongoId()
    .withMessage('无效的客户ID'),

  body('manager')
    .notEmpty()
    .withMessage('项目经理ID不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('plannedStartDate')
    .notEmpty()
    .withMessage('计划开始日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('plannedEndDate')
    .notEmpty()
    .withMessage('计划结束日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.plannedStartDate)) {
        throw new Error('结束日期必须晚于开始日期');
      }
      return true;
    }),

  body('budget.total')
    .notEmpty()
    .withMessage('总预算不能为空')
    .isFloat({ min: 0 })
    .withMessage('总预算必须是非负数'),

  body('budget.categories.*')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预算金额必须是非负数'),

  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('地址不能超过200个字符'),

  body('location.coordinates')
    .optional()
    .isArray()
    .withMessage('坐标必须是数组')
    .custom((value) => {
      if (value && value.length !== 2) {
        throw new Error('坐标必须包含经度和纬度');
      }
      return true;
    }),

  body('team')
    .optional()
    .isArray()
    .withMessage('团队成员必须是数组'),

  body('team.*.user')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('team.*.role')
    .optional()
    .isIn(['manager', 'engineer', 'worker', 'consultant'])
    .withMessage('无效的角色类型'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('描述不能超过1000个字符')
]);

// 更新项目验证
exports.validateUpdateProject = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('项目名称不能为空')
    .isLength({ max: 100 })
    .withMessage('项目名称不能超过100个字符'),

  // ... 其他字段的验证规则与 validateCreateProject 相同，但都是可选的
]);

// 项目进度更新验证
exports.validateUpdateProgress = validate([
  body('progress')
    .notEmpty()
    .withMessage('进度不能为空')
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须是0-100之间的整数'),

  body('progressNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('进度说明不能超过500个字符')
]);

// 项目团队更新验证
exports.validateUpdateTeam = validate([
  body()
    .isArray()
    .withMessage('团队成员必须是数组'),

  body('*.user')
    .notEmpty()
    .withMessage('用户ID不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('*.role')
    .notEmpty()
    .withMessage('角色不能为空')
    .isIn(['manager', 'engineer', 'worker', 'consultant'])
    .withMessage('无效的角色类型')
]);

// 项目里程碑验证
exports.validateCreateMilestone = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('里程碑名称不能为空')
    .isLength({ max: 100 })
    .withMessage('里程碑名称不能超过100个字符'),

  body('plannedDate')
    .notEmpty()
    .withMessage('计划日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('weight')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('权重必须是0-100之间的数字'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符')
]);

// 项目风险验证
exports.validateCreateRisk = validate([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('风险标题不能为空')
    .isLength({ max: 100 })
    .withMessage('风险标题不能超过100个字符'),

  body('type')
    .notEmpty()
    .withMessage('风险类型不能为空')
    .isIn(['technical', 'schedule', 'cost', 'resource', 'quality', 'other'])
    .withMessage('无效的风险类型'),

  body('probability')
    .notEmpty()
    .withMessage('发生概率不能为空')
    .isIn(['low', 'medium', 'high'])
    .withMessage('无效的概率级别'),

  body('impact')
    .notEmpty()
    .withMessage('影响程度不能为空')
    .isIn(['minor', 'moderate', 'major', 'critical'])
    .withMessage('无效的影响级别'),

  body('response')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('应对措施不能超过500个字符')
]);

// 项目资源分配验证
exports.validateAllocateResource = validate([
  body('resourceType')
    .notEmpty()
    .withMessage('资源类型不能为空')
    .isIn(['human', 'equipment', 'material'])
    .withMessage('无效的资源类型'),

  body('resourceId')
    .notEmpty()
    .withMessage('资源ID不能为空')
    .isMongoId()
    .withMessage('无效的资源ID'),

  body('quantity')
    .notEmpty()
    .withMessage('数量不能为空')
    .isFloat({ min: 0 })
    .withMessage('数量必须是非负数'),

  body('startDate')
    .notEmpty()
    .withMessage('开始日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('endDate')
    .notEmpty()
    .withMessage('结束日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('结束日期必须晚于开始日期');
      }
      return true;
    })
]);

// 项目成本记录验证
exports.validateRecordCost = validate([
  body('type')
    .notEmpty()
    .withMessage('成本类型不能为空')
    .isIn(['labor', 'material', 'equipment', 'subcontract', 'overhead', 'other'])
    .withMessage('无效的成本类型'),

  body('amount')
    .notEmpty()
    .withMessage('金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('金额必须是非负数'),

  body('date')
    .notEmpty()
    .withMessage('日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符')
]);

// 项目文档验证
exports.validateUploadDocument = validate([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('文档标题不能为空')
    .isLength({ max: 100 })
    .withMessage('文档标题不能超过100个字符'),

  body('category')
    .notEmpty()
    .withMessage('文档类别不能为空')
    .isIn(['contract', 'design', 'report', 'permit', 'other'])
    .withMessage('无效的文档类别'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符')
]);

// 查询验证
exports.validateProjectQuery = validate([
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),

  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'suspended', 'cancelled'])
    .withMessage('无效的项目状态'),

  query('type')
    .optional()
    .isIn(['construction', 'renovation', 'maintenance', 'design', 'consulting'])
    .withMessage('无效的项目类型'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('无效的开始日期格式'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('无效的结束日期格式')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('结束日期必须晚于开始日期');
      }
      return true;
    })
]); 