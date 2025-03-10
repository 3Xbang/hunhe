/**
 * 预算管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('../validator');

exports.validateCreateBudget = validate([
  body('name')
    .notEmpty()
    .withMessage('预算名称不能为空')
    .isLength({ max: 100 })
    .withMessage('预算名称不能超过100个字符'),
  
  body('project')
    .notEmpty()
    .withMessage('项目不能为空')
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  body('year')
    .notEmpty()
    .withMessage('预算年度不能为空')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('预算年度格式不正确'),

  body('type')
    .notEmpty()
    .withMessage('预算类型不能为空')
    .isIn(['project', 'department'])
    .withMessage('预算类型必须是project或department'),

  body('amount')
    .notEmpty()
    .withMessage('预算金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('预算金额必须大于0'),

  body('items')
    .isArray()
    .withMessage('预算项目必须是数组')
    .notEmpty()
    .withMessage('预算项目不能为空'),

  body('items.*.name')
    .notEmpty()
    .withMessage('预算项目名称不能为空'),

  body('items.*.category')
    .notEmpty()
    .withMessage('预算项目类别不能为空'),

  body('items.*.plannedAmount')
    .notEmpty()
    .withMessage('计划金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('计划金额必须大于0')
]);

exports.validateUpdateBudget = validate([
  param('id')
    .isMongoId()
    .withMessage('预算ID格式不正确'),

  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('预算名称不能超过100个字符'),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预算金额必须大于0'),

  body('items')
    .optional()
    .isArray()
    .withMessage('预算项目必须是数组'),

  body('items.*.name')
    .optional()
    .notEmpty()
    .withMessage('预算项目名称不能为空'),

  body('items.*.plannedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('计划金额必须大于0')
]);

exports.validateApproveBudget = validate([
  param('id')
    .isMongoId()
    .withMessage('预算ID格式不正确'),

  body('status')
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('审批状态必须是approved或rejected'),

  body('comments')
    .optional()
    .isLength({ max: 500 })
    .withMessage('审批意见不能超过500个字符')
]);

exports.validateQueryBudgets = validate([
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

  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('年度格式不正确'),

  query('type')
    .optional()
    .isIn(['project', 'department'])
    .withMessage('预算类型必须是project或department'),

  query('status')
    .optional()
    .isIn(['draft', 'pending', 'approved', 'rejected'])
    .withMessage('状态值不正确')
]); 