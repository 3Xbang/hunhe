/**
 * 成本管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('../validator');

exports.validateCreateCost = validate([
  body('project')
    .notEmpty()
    .withMessage('项目不能为空')
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  body('type')
    .notEmpty()
    .withMessage('成本类型不能为空')
    .isIn(['material', 'equipment', 'labor', 'other'])
    .withMessage('成本类型不正确'),

  body('item')
    .notEmpty()
    .withMessage('成本项目不能为空')
    .isLength({ max: 100 })
    .withMessage('成本项目名称不能超过100个字符'),

  body('date')
    .notEmpty()
    .withMessage('发生日期不能为空')
    .isISO8601()
    .withMessage('日期格式不正确'),

  body('amount')
    .notEmpty()
    .withMessage('金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('金额必须大于0'),

  body('budgetItem')
    .optional()
    .isMongoId()
    .withMessage('预算项目ID格式不正确'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('供应商ID格式不正确'),

  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

exports.validateUpdateCost = validate([
  param('id')
    .isMongoId()
    .withMessage('成本记录ID格式不正确'),

  body('item')
    .optional()
    .isLength({ max: 100 })
    .withMessage('成本项目名称不能超过100个字符'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('日期格式不正确'),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('金额必须大于0'),

  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

exports.validateQueryCosts = validate([
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
    .isIn(['material', 'equipment', 'labor', 'other'])
    .withMessage('成本类型不正确'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确')
]); 