/**
 * 合同管理验证器
 */
const { body } = require('express-validator');
const { validate } = require('./validate');

// 合同验证
exports.validateCreateContract = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('合同编号不能为空')
    .isLength({ max: 50 })
    .withMessage('合同编号不能超过50个字符'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('合同名称不能为空')
    .isLength({ max: 100 })
    .withMessage('合同名称不能超过100个字符'),

  body('type')
    .notEmpty()
    .withMessage('合同类型不能为空')
    .isIn(['main', 'subcontract', 'supply', 'service', 'lease', 'other'])
    .withMessage('无效的合同类型'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('partyA.company')
    .trim()
    .notEmpty()
    .withMessage('甲方公司名称不能为空')
    .isLength({ max: 100 })
    .withMessage('甲方公司名称不能超过100个字符'),

  body('partyA.representative')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('甲方代表不能超过50个字符'),

  body('partyA.contact')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('甲方联系人不能超过50个字符'),

  body('partyA.phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('甲方电话不能超过20个字符'),

  body('partyA.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('无效的甲方邮箱格式'),

  body('partyB.company')
    .trim()
    .notEmpty()
    .withMessage('乙方公司名称不能为空')
    .isLength({ max: 100 })
    .withMessage('乙方公司名称不能超过100个字符'),

  body('partyB.representative')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('乙方代表不能超过50个字符'),

  body('partyB.contact')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('乙方联系人不能超过50个字符'),

  body('partyB.phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('乙方电话不能超过20个字符'),

  body('partyB.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('无效的乙方邮箱格式'),

  body('amount.value')
    .notEmpty()
    .withMessage('合同金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('合同金额必须是正数'),

  body('amount.currency')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('币种不能超过10个字符'),

  body('amount.tax.rate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('税率必须在0-1之间'),

  body('term.startDate')
    .notEmpty()
    .withMessage('合同开始日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('term.endDate')
    .notEmpty()
    .withMessage('合同结束日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.term.startDate)) {
        throw new Error('合同结束日期必须晚于开始日期');
      }
      return true;
    }),

  body('paymentTerms.method')
    .notEmpty()
    .withMessage('付款方式不能为空')
    .isIn(['advance', 'installment', 'milestone', 'completion'])
    .withMessage('无效的付款方式'),

  body('paymentTerms.installments')
    .optional()
    .isArray()
    .withMessage('付款计划必须是数组'),

  body('paymentTerms.installments.*.percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('付款比例必须在0-100之间'),

  body('paymentTerms.installments.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('付款金额必须是正数'),

  body('paymentTerms.installments.*.dueDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('performance.bondRequired')
    .optional()
    .isBoolean()
    .withMessage('履约保证金要求必须是布尔值'),

  body('performance.bondType')
    .optional()
    .isIn(['cash', 'bank_guarantee', 'insurance'])
    .withMessage('无效的履约保证金类型'),

  body('performance.bondAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('履约保证金金额必须是正数'),

  body('warranty.period')
    .optional()
    .isInt({ min: 0 })
    .withMessage('质保期必须是正整数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateContract = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('合同名称不能为空')
    .isLength({ max: 100 })
    .withMessage('合同名称不能超过100个字符'),

  // ... 其他字段的验证规则与 validateCreateContract 相同，但都是可选的
]);

exports.validateContractApproval = validate([
  body('status')
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审批状态'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批意见不能超过500个字符')
]);

exports.validateContractSigning = validate([
  body('method')
    .notEmpty()
    .withMessage('签署方式不能为空')
    .isIn(['physical', 'electronic'])
    .withMessage('无效的签署方式'),

  body('date')
    .notEmpty()
    .withMessage('签署日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('签署地点不能超过100个字符'),

  body('partyASignatory.name')
    .notEmpty()
    .withMessage('甲方签署人姓名不能为空')
    .isLength({ max: 50 })
    .withMessage('甲方签署人姓名不能超过50个字符'),

  body('partyASignatory.title')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('甲方签署人职务不能超过50个字符'),

  body('partyBSignatory.name')
    .notEmpty()
    .withMessage('乙方签署人姓名不能为空')
    .isLength({ max: 50 })
    .withMessage('乙方签署人姓名不能超过50个字符'),

  body('partyBSignatory.title')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('乙方签署人职务不能超过50个字符')
]);

// 付款记录验证
exports.validateCreatePayment = validate([
  body('contract')
    .notEmpty()
    .withMessage('合同ID不能为空')
    .isMongoId()
    .withMessage('无效的合同ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('付款编号不能为空')
    .isLength({ max: 50 })
    .withMessage('付款编号不能超过50个字符'),

  body('type')
    .notEmpty()
    .withMessage('付款类型不能为空')
    .isIn(['deposit', 'advance', 'progress', 'milestone', 'final', 'retention'])
    .withMessage('无效的付款类型'),

  body('amount.planned')
    .notEmpty()
    .withMessage('计划付款金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('付款金额必须是正数'),

  body('amount.currency')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('币种不能超过10个字符'),

  body('plannedDate')
    .notEmpty()
    .withMessage('计划付款日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('conditions.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('付款条件描述不能超过500个字符'),

  body('invoice.required')
    .optional()
    .isBoolean()
    .withMessage('发票要求必须是布尔值'),

  body('invoice.number')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('发票号码不能超过50个字符'),

  body('payment.method')
    .optional()
    .isIn(['cash', 'bank_transfer', 'check'])
    .withMessage('无效的支付方式'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdatePayment = validate([
  body('type')
    .optional()
    .isIn(['deposit', 'advance', 'progress', 'milestone', 'final', 'retention'])
    .withMessage('无效的付款类型'),

  // ... 其他字段的验证规则与 validateCreatePayment 相同，但都是可选的
]);

exports.validatePaymentApproval = validate([
  body('status')
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审批状态'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批意见不能超过500个字符')
]);

exports.validatePaymentConfirmation = validate([
  body('actualDate')
    .notEmpty()
    .withMessage('实际付款日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('actualAmount')
    .notEmpty()
    .withMessage('实际付款金额不能为空')
    .isFloat({ min: 0 })
    .withMessage('付款金额必须是正数'),

  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('付款参考号不能超过100个字符')
]);

// 变更单验证
exports.validateCreateChangeOrder = validate([
  body('contract')
    .notEmpty()
    .withMessage('合同ID不能为空')
    .isMongoId()
    .withMessage('无效的合同ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('变更单编号不能为空')
    .isLength({ max: 50 })
    .withMessage('变更单编号不能超过50个字符'),

  body('type')
    .notEmpty()
    .withMessage('变更类型不能为空')
    .isIn(['scope', 'schedule', 'price', 'technical', 'other'])
    .withMessage('无效的变更类型'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('变更标题不能为空')
    .isLength({ max: 100 })
    .withMessage('变更标题不能超过100个字符'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('变更描述不能为空')
    .isLength({ max: 500 })
    .withMessage('变更描述不能超过500个字符'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('变更原因不能为空')
    .isLength({ max: 500 })
    .withMessage('变更原因不能超过500个字符'),

  body('initiator.party')
    .optional()
    .isIn(['partyA', 'partyB'])
    .withMessage('无效的发起方'),

  body('impact.scope.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('范围影响描述不能超过500个字符'),

  body('impact.schedule.delay')
    .optional()
    .isInt({ min: 0 })
    .withMessage('延期天数必须是正整数'),

  body('impact.schedule.newEndDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('impact.cost.original')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('原始金额必须是正数'),

  body('impact.cost.change')
    .optional()
    .isFloat()
    .withMessage('变更金额必须是数字'),

  body('impact.cost.new')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('新金额必须是正数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateChangeOrder = validate([
  body('type')
    .optional()
    .isIn(['scope', 'schedule', 'price', 'technical', 'other'])
    .withMessage('无效的变更类型'),

  // ... 其他字段的验证规则与 validateCreateChangeOrder 相同，但都是可选的
]);

exports.validateChangeOrderApproval = validate([
  body('status')
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审批状态'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批意见不能超过500个字符')
]);

exports.validateChangeOrderImplementation = validate([
  body('status')
    .notEmpty()
    .withMessage('实施状态不能为空')
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('无效的实施状态'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('无效的开始日期格式'),

  body('completionDate')
    .optional()
    .isISO8601()
    .withMessage('无效的完成日期格式')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('完成日期必须晚于开始日期');
      }
      return true;
    })
]);

exports.validateChangeOrderVerification = validate([
  body('result')
    .notEmpty()
    .withMessage('验证结果不能为空')
    .isIn(['accepted', 'rejected'])
    .withMessage('无效的验证结果'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('验证意见不能超过500个字符')
]); 