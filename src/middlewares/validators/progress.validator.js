/**
 * 进度管理验证器
 */
const { body } = require('express-validator');
const { validate } = require('./validate');

exports.validateCreateMilestone = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('里程碑名称不能为空')
    .isLength({ max: 100 })
    .withMessage('里程碑名称不能超过100个字符'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

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
        throw new Error('计划结束日期必须晚于计划开始日期');
      }
      return true;
    }),

  body('dependencies')
    .optional()
    .isArray()
    .withMessage('依赖关系必须是数组'),

  body('dependencies.*.milestone')
    .optional()
    .isMongoId()
    .withMessage('无效的里程碑ID'),

  body('dependencies.*.type')
    .optional()
    .isIn(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'])
    .withMessage('无效的依赖类型'),

  body('responsiblePerson')
    .notEmpty()
    .withMessage('负责人不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('participants')
    .optional()
    .isArray()
    .withMessage('参与人必须是数组'),

  body('participants.*')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateMilestone = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('里程碑名称不能为空')
    .isLength({ max: 100 })
    .withMessage('里程碑名称不能超过100个字符'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('plannedStartDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('plannedEndDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (req.body.plannedStartDate && new Date(value) <= new Date(req.body.plannedStartDate)) {
        throw new Error('计划结束日期必须晚于计划开始日期');
      }
      return true;
    }),

  body('actualStartDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('actualEndDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (req.body.actualStartDate && new Date(value) <= new Date(req.body.actualStartDate)) {
        throw new Error('实际结束日期必须晚于实际开始日期');
      }
      return true;
    }),

  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须是0-100之间的整数'),

  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed', 'delayed', 'cancelled'])
    .withMessage('无效的状态'),

  body('delayReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('延期原因不能超过500个字符'),

  // ... 其他字段的验证规则与 validateCreateMilestone 相同，但都是可选的
]);

exports.validateCreateTask = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('任务名称不能为空')
    .isLength({ max: 100 })
    .withMessage('任务名称不能超过100个字符'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('milestone')
    .notEmpty()
    .withMessage('里程碑ID不能为空')
    .isMongoId()
    .withMessage('无效的里程碑ID'),

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
        throw new Error('计划结束日期必须晚于计划开始日期');
      }
      return true;
    }),

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预计工时必须是正数'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('无效的优先级'),

  body('dependencies')
    .optional()
    .isArray()
    .withMessage('依赖关系必须是数组'),

  body('dependencies.*.task')
    .optional()
    .isMongoId()
    .withMessage('无效的任务ID'),

  body('dependencies.*.type')
    .optional()
    .isIn(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'])
    .withMessage('无效的依赖类型'),

  body('assignedTo')
    .notEmpty()
    .withMessage('执行人不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('reviewedBy')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('participants')
    .optional()
    .isArray()
    .withMessage('参与人必须是数组'),

  body('participants.*')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('materials')
    .optional()
    .isArray()
    .withMessage('材料必须是数组'),

  body('materials.*.material')
    .optional()
    .isMongoId()
    .withMessage('无效的材料ID'),

  body('materials.*.plannedQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('计划数量必须是正数'),

  body('equipment')
    .optional()
    .isArray()
    .withMessage('设备必须是数组'),

  body('equipment.*.equipment')
    .optional()
    .isMongoId()
    .withMessage('无效的设备ID'),

  body('equipment.*.plannedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('计划工时必须是正数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateTask = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('任务名称不能为空')
    .isLength({ max: 100 })
    .withMessage('任务名称不能超过100个字符'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('plannedStartDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('plannedEndDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (req.body.plannedStartDate && new Date(value) <= new Date(req.body.plannedStartDate)) {
        throw new Error('计划结束日期必须晚于计划开始日期');
      }
      return true;
    }),

  body('actualStartDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('actualEndDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (req.body.actualStartDate && new Date(value) <= new Date(req.body.actualStartDate)) {
        throw new Error('实际结束日期必须晚于实际开始日期');
      }
      return true;
    }),

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预计工时必须是正数'),

  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('实际工时必须是正数'),

  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须是0-100之间的整数'),

  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed', 'delayed', 'cancelled'])
    .withMessage('无效的状态'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('无效的优先级'),

  body('delayReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('延期原因不能超过500个字符'),

  // ... 其他字段的验证规则与 validateCreateTask 相同，但都是可选的
]);

exports.validateTaskProgress = validate([
  body('progress')
    .notEmpty()
    .withMessage('进度不能为空')
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须是0-100之间的整数')
]);

exports.validateTaskIssue = validate([
  body('description')
    .trim()
    .notEmpty()
    .withMessage('问题描述不能为空')
    .isLength({ max: 500 })
    .withMessage('问题描述不能超过500个字符'),

  body('severity')
    .notEmpty()
    .withMessage('严重程度不能为空')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('无效的严重程度'),

  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('无效的状态')
]);

exports.validateTaskIssueResolution = validate([
  body('solution')
    .trim()
    .notEmpty()
    .withMessage('解决方案不能为空')
    .isLength({ max: 500 })
    .withMessage('解决方案不能超过500个字符')
]); 