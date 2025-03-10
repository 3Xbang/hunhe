/**
 * 发票管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('../validator');

exports.validateCreateInvoice = validate([
  body('number')
    .notEmpty()
    .withMessage('发票号码不能为空')
    .matches(/^[A-Z0-9]{10,12}$/)
    .withMessage('发票号码格式不正确'),

  body('type')
    .notEmpty()
    .withMessage('发票类型不能为空')
    .isIn(['vat_special', 'vat_normal', 'other'])
    .withMessage('发票类型不正确'),

  body('project')
    .notEmpty()
    .withMessage('项目不能为空')
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  body('supplier')
    .notEmpty()
    .withMessage('供应商不能为空')
    .isMongoId()
    .withMessage('供应商ID格式不正确'),

  body('issueDate')
    .notEmpty()
    .withMessage('开票日期不能为空')
    .isISO8601()
    .withMessage('日期格式不正确'),

  body('amount')
    .notEmpty()
    .withMessage('金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('金额必须大于0'),

  body('taxRate')
    .notEmpty()
    .withMessage('税率不能为空')
    .isFloat({ min: 0, max: 100 })
    .withMessage('税率必须在0-100之间'),

  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

exports.validateVerifyInvoice = validate([
  param('id')
    .isMongoId()
    .withMessage('发票ID格式不正确'),

  body('operator')
    .notEmpty()
    .withMessage('操作人不能为空')
    .isMongoId()
    .withMessage('操作人ID格式不正确')
]);

exports.validateCancelInvoice = validate([
  param('id')
    .isMongoId()
    .withMessage('发票ID格式不正确'),

  body('reason')
    .notEmpty()
    .withMessage('作废原因不能为空')
    .isLength({ max: 500 })
    .withMessage('作废原因不能超过500个字符'),

  body('operator')
    .notEmpty()
    .withMessage('操作人不能为空')
    .isMongoId()
    .withMessage('操作人ID格式不正确')
]);

exports.validateQueryInvoices = validate([
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

  query('supplier')
    .optional()
    .isMongoId()
    .withMessage('供应商ID格式不正确'),

  query('type')
    .optional()
    .isIn(['vat_special', 'vat_normal', 'other'])
    .withMessage('发票类型不正确'),

  query('status')
    .optional()
    .isIn(['pending', 'verified', 'reimbursed', 'cancelled'])
    .withMessage('状态值不正确'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确')
]); 