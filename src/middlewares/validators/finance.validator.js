/**
 * 财务验证器
 */
const { body } = require('express-validator');
const { validate } = require('./validate');

exports.validateCreateTransaction = validate([
  body('type')
    .trim()
    .notEmpty()
    .withMessage('交易类型不能为空')
    .isIn(['income', 'expense'])
    .withMessage('无效的交易类型'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('交易类别不能为空')
    .isIn([
      'project_payment',
      'equipment_rental',
      'material_sale',
      'compensation',
      'other_income',
      'material_purchase',
      'equipment_purchase',
      'labor_cost',
      'subcontract',
      'equipment_maintenance',
      'office_expense',
      'travel_expense',
      'insurance',
      'tax',
      'other_expense'
    ])
    .withMessage('无效的交易类别'),

  body('amount')
    .notEmpty()
    .withMessage('金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('金额必须是正数'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('交易描述不能为空')
    .isLength({ max: 500 })
    .withMessage('交易描述不能超过500个字符'),

  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('无效的供应商ID'),

  body('equipment')
    .optional()
    .isMongoId()
    .withMessage('无效的设备ID'),

  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('支付方式不能为空')
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'other'])
    .withMessage('无效的支付方式'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.date || Date.now())) {
        throw new Error('到期日期必须晚于交易日期');
      }
      return true;
    }),

  body('invoice.number')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('发票号码不能为空'),

  body('invoice.date')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('invoice.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('发票金额必须是正数'),

  body('invoice.tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('税额必须是正数'),

  body('contract.number')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('合同号码不能为空'),

  body('contract.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('合同名称不能为空')
]);

exports.validateUpdateTransaction = validate([
  body('type')
    .optional()
    .trim()
    .isIn(['income', 'expense'])
    .withMessage('无效的交易类型'),

  body('category')
    .optional()
    .trim()
    .isIn([
      'project_payment',
      'equipment_rental',
      'material_sale',
      'compensation',
      'other_income',
      'material_purchase',
      'equipment_purchase',
      'labor_cost',
      'subcontract',
      'equipment_maintenance',
      'office_expense',
      'travel_expense',
      'insurance',
      'tax',
      'other_expense'
    ])
    .withMessage('无效的交易类别'),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('金额必须是正数'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('交易描述不能为空')
    .isLength({ max: 500 })
    .withMessage('交易描述不能超过500个字符'),

  // ... 其他字段的验证规则与 validateCreateTransaction 相同，但都是可选的
]);

exports.validateTransactionStatus = validate([
  body('status')
    .trim()
    .notEmpty()
    .withMessage('状态不能为空')
    .isIn(['pending', 'partial', 'completed', 'cancelled'])
    .withMessage('无效的状态')
]);

exports.validateTransactionApproval = validate([
  body('status')
    .trim()
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审批状态'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批备注不能超过500个字符')
]);

exports.validateCreateBudget = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('year')
    .notEmpty()
    .withMessage('年份不能为空')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('无效的年份'),

  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('无效的月份'),

  body('plannedIncome')
    .isArray()
    .withMessage('计划收入必须是数组'),

  body('plannedIncome.*.category')
    .notEmpty()
    .withMessage('收入类别不能为空')
    .isIn([
      'project_payment',
      'equipment_rental',
      'material_sale',
      'compensation',
      'other_income'
    ])
    .withMessage('无效的收入类别'),

  body('plannedIncome.*.amount')
    .notEmpty()
    .withMessage('计划收入金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('计划收入金额必须是正数'),

  body('plannedExpense')
    .isArray()
    .withMessage('计划支出必须是数组'),

  body('plannedExpense.*.category')
    .notEmpty()
    .withMessage('支出类别不能为空')
    .isIn([
      'material_purchase',
      'equipment_purchase',
      'labor_cost',
      'subcontract',
      'equipment_maintenance',
      'office_expense',
      'travel_expense',
      'insurance',
      'tax',
      'other_expense'
    ])
    .withMessage('无效的支出类别'),

  body('plannedExpense.*.amount')
    .notEmpty()
    .withMessage('计划支出金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('计划支出金额必须是正数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateBudget = validate([
  body('plannedIncome')
    .optional()
    .isArray()
    .withMessage('计划收入必须是数组'),

  body('plannedIncome.*.category')
    .optional()
    .isIn([
      'project_payment',
      'equipment_rental',
      'material_sale',
      'compensation',
      'other_income'
    ])
    .withMessage('无效的收入类别'),

  body('plannedIncome.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('计划收入金额必须是正数'),

  body('plannedExpense')
    .optional()
    .isArray()
    .withMessage('计划支出必须是数组'),

  body('plannedExpense.*.category')
    .optional()
    .isIn([
      'material_purchase',
      'equipment_purchase',
      'labor_cost',
      'subcontract',
      'equipment_maintenance',
      'office_expense',
      'travel_expense',
      'insurance',
      'tax',
      'other_expense'
    ])
    .withMessage('无效的支出类别'),

  body('plannedExpense.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('计划支出金额必须是正数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateBudgetApproval = validate([
  body('status')
    .trim()
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审批状态'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批备注不能超过500个字符')
]); 