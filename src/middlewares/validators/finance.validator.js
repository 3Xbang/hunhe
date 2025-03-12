/**
 * 财务验证器
 */
const { body, param, query } = require('express-validator');
const { validate } = require('./validate');
const { badRequestError } = require('../../utils/appError');

/**
 * 验证创建交易请求
 */
exports.validateCreateTransaction = validate([
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('交易类型必须是 income 或 expense'),
  
  body('amount')
    .isNumeric()
    .withMessage('金额必须是数字')
    .isFloat({ min: 0 })
    .withMessage('金额不能为负数'),
  
  body('date')
    .isISO8601()
    .withMessage('日期格式无效'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('交易描述不能为空')
    .isLength({ max: 500 })
    .withMessage('交易描述不能超过500个字符'),
  
  body('reference')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('参考号不能超过50个字符'),
  
  body('invoice.number')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('发票号不能超过50个字符'),
  
  body('invoice.date')
    .optional()
    .isISO8601()
    .withMessage('发票日期格式无效'),
  
  body('contract.number')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('合同号不能超过50个字符'),
  
  body('contract.date')
    .optional()
    .isISO8601()
    .withMessage('合同日期格式无效')
]);

/**
 * 验证更新交易请求
 */
exports.validateUpdateTransaction = validate([
  param('id')
    .isMongoId()
    .withMessage('无效的交易ID'),
  
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('交易类型必须是 income 或 expense'),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('金额必须是数字')
    .isFloat({ min: 0 })
    .withMessage('金额不能为负数'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('日期格式无效'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('交易描述不能为空')
    .isLength({ max: 500 })
    .withMessage('交易描述不能超过500个字符'),
  
  body('reference')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('参考号不能超过50个字符')
]);

/**
 * 验证交易状态更新请求
 */
exports.validateTransactionStatus = validate([
  param('id')
    .isMongoId()
    .withMessage('无效的交易ID'),
  
  body('status')
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('无效的交易状态')
]);

/**
 * 验证交易审批请求
 */
exports.validateTransactionApproval = validate([
  param('id')
    .isMongoId()
    .withMessage('无效的交易ID'),
  
  body('approved')
    .isBoolean()
    .withMessage('approved 必须是布尔值'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批意见不能超过500个字符')
]);

/**
 * 验证创建预算请求
 */
exports.validateCreateBudget = validate([
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('年份必须在2000-2100之间'),
  
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('月份必须在1-12之间'),
  
  body('department')
    .trim()
    .notEmpty()
    .withMessage('部门不能为空'),
  
  body('type')
    .isIn(['department', 'project'])
    .withMessage('预算类型必须是 department 或 project'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('预算项目不能为空'),
  
  body('items.*.name')
    .trim()
    .notEmpty()
    .withMessage('预算项目名称不能为空'),
  
  body('items.*.type')
    .isIn(['income', 'expense'])
    .withMessage('预算项目类型必须是 income 或 expense'),
  
  body('items.*.amount')
    .isNumeric()
    .withMessage('预算金额必须是数字')
    .isFloat({ min: 0 })
    .withMessage('预算金额不能为负数')
]);

/**
 * 验证更新预算请求
 */
exports.validateUpdateBudget = validate([
  param('id')
    .isMongoId()
    .withMessage('无效的预算ID'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('预算项目不能为空'),
  
  body('items.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('预算项目名称不能为空'),
  
  body('items.*.type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('预算项目类型必须是 income 或 expense'),
  
  body('items.*.amount')
    .optional()
    .isNumeric()
    .withMessage('预算金额必须是数字')
    .isFloat({ min: 0 })
    .withMessage('预算金额不能为负数')
]);

/**
 * 验证预算审批请求
 */
exports.validateBudgetApproval = validate([
  param('id')
    .isMongoId()
    .withMessage('无效的预算ID'),
  
  body('approved')
    .isBoolean()
    .withMessage('approved 必须是布尔值'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批意见不能超过500个字符')
]); 