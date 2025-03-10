/**
 * 付款管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('../validator');

exports.validateCreatePayment = validate([
  body('project')
    .notEmpty()
    .withMessage('项目不能为空')
    .isMongoId()
    .withMessage('项目ID格式不正确'),

  body('type')
    .notEmpty()
    .withMessage('付款类型不能为空')
    .isIn(['advance', 'progress', 'settlement', 'other'])
    .withMessage('付款类型不正确'),

  body('amount')
    .notEmpty()
    .withMessage('付款金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('付款金额必须大于0'),

  body('payee')
    .notEmpty()
    .withMessage('收款方不能为空')
    .isMongoId()
    .withMessage('收款方ID格式不正确'),

  body('plannedDate')
    .notEmpty()
    .withMessage('计划付款日期不能为空')
    .isISO8601()
    .withMessage('日期格式不正确'),

  body('method')
    .notEmpty()
    .withMessage('付款方式不能为空')
    .isIn(['bank_transfer', 'cash', 'check'])
    .withMessage('付款方式不正确'),

  body('bankInfo')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('银行账户信息不能为空'),

  body('bankInfo.accountName')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('账户名称不能为空'),

  body('bankInfo.bankName')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('开户银行不能为空'),

  body('bankInfo.accountNo')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('账号不能为空')
    .matches(/^\d{16,19}$/)
    .withMessage('账号格式不正确'),

  body('invoices')
    .optional()
    .isArray()
    .withMessage('发票必须是数组'),

  body('invoices.*')
    .optional()
    .isMongoId()
    .withMessage('发票ID格式不正确'),

  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

exports.validateApprovePayment = validate([
  param('id')
    .isMongoId()
    .withMessage('付款ID格式不正确'),

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

exports.validateConfirmPayment = validate([
  param('id')
    .isMongoId()
    .withMessage('付款ID格式不正确'),

  body('actualDate')
    .optional()
    .isISO8601()
    .withMessage('实际付款日期格式不正确')
]);

exports.validateQueryPayments = validate([
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

  query('payee')
    .optional()
    .isMongoId()
    .withMessage('收款方ID格式不正确'),

  query('type')
    .optional()
    .isIn(['advance', 'progress', 'settlement', 'other'])
    .withMessage('付款类型不正确'),

  query('status')
    .optional()
    .isIn(['pending', 'approved', 'paid', 'rejected'])
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