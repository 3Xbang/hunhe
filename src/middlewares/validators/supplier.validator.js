/**
 * 供应商管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('./validate');

// 创建供应商验证
exports.validateCreateSupplier = validate([
  // 基本信息验证
  body('code')
    .notEmpty().withMessage('供应商编号不能为空')
    .trim()
    .isString().withMessage('供应商编号必须是字符串')
    .matches(/^[A-Z0-9]{3,10}$/).withMessage('供应商编号格式不正确(3-10位大写字母和数字)'),
  
  body('name')
    .notEmpty().withMessage('供应商名称不能为空')
    .trim()
    .isString().withMessage('供应商名称必须是字符串')
    .isLength({ min: 2, max: 100 }).withMessage('供应商名称长度必须在2-100之间'),
  
  body('category')
    .notEmpty().withMessage('供应商类别不能为空')
    .isIn(['material', 'equipment', 'service', 'contractor', 'other'])
    .withMessage('无效的供应商类别'),

  // 企业信息验证
  body('businessLicense.number')
    .notEmpty().withMessage('营业执照号不能为空')
    .matches(/^[0-9A-Z]{15,18}$/).withMessage('营业执照号格式不正确'),
  
  body('businessLicense.expireDate')
    .notEmpty().withMessage('营业执照有效期不能为空')
    .isISO8601().withMessage('营业执照有效期格式不正确'),
  
  body('taxInfo.number')
    .optional()
    .matches(/^[0-9A-Z]{15,20}$/).withMessage('税号格式不正确'),

  // 联系信息验证
  body('contacts')
    .isArray().withMessage('联系人信息必须是数组')
    .notEmpty().withMessage('至少需要一个联系人'),
  
  body('contacts.*.name')
    .notEmpty().withMessage('联系人姓名不能为空')
    .isString().withMessage('联系人姓名必须是字符串'),
  
  body('contacts.*.phone')
    .notEmpty().withMessage('联系人电话不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('联系人电话格式不正确'),
  
  body('contacts.*.email')
    .optional()
    .isEmail().withMessage('联系人邮箱格式不正确'),

  // 地址信息验证
  body('address.province')
    .notEmpty().withMessage('省份不能为空')
    .isString().withMessage('省份必须是字符串'),
  
  body('address.city')
    .notEmpty().withMessage('城市不能为空')
    .isString().withMessage('城市必须是字符串'),
  
  body('address.street')
    .notEmpty().withMessage('街道地址不能为空')
    .isString().withMessage('街道地址必须是字符串'),

  // 银行信息验证
  body('bankInfo.accountName')
    .notEmpty().withMessage('开户名不能为空')
    .isString().withMessage('开户名必须是字符串'),
  
  body('bankInfo.bankName')
    .notEmpty().withMessage('开户行不能为空')
    .isString().withMessage('开户行必须是字符串'),
  
  body('bankInfo.accountNo')
    .notEmpty().withMessage('银行账号不能为空')
    .matches(/^\d{16,19}$/).withMessage('银行账号格式不正确'),

  // 合作信息验证
  body('cooperation.startDate')
    .notEmpty().withMessage('合作开始日期不能为空')
    .isISO8601().withMessage('合作开始日期格式不正确')
]);

// 更新供应商验证
exports.validateUpdateSupplier = validate([
  param('id')
    .isMongoId().withMessage('无效的供应商ID'),
  
  body('name')
    .optional()
    .trim()
    .isString().withMessage('供应商名称必须是字符串')
    .isLength({ min: 2, max: 100 }).withMessage('供应商名称长度必须在2-100之间'),
  
  body('businessLicense.expireDate')
    .optional()
    .isISO8601().withMessage('营业执照有效期格式不正确'),
  
  body('contacts.*.phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/).withMessage('联系人电话格式不正确'),
  
  body('contacts.*.email')
    .optional()
    .isEmail().withMessage('联系人邮箱格式不正确'),
  
  body('bankInfo.accountNo')
    .optional()
    .matches(/^\d{16,19}$/).withMessage('银行账号格式不正确')
]);

// 添加评价验证
exports.validateAddEvaluation = validate([
  param('id')
    .isMongoId().withMessage('无效的供应商ID'),
  
  body('project')
    .notEmpty().withMessage('项目不能为空')
    .isMongoId().withMessage('无效的项目ID'),
  
  body('quality')
    .notEmpty().withMessage('质量评分不能为空')
    .isFloat({ min: 0, max: 5 }).withMessage('质量评分必须在0-5之间'),
  
  body('delivery')
    .notEmpty().withMessage('交付评分不能为空')
    .isFloat({ min: 0, max: 5 }).withMessage('交付评分必须在0-5之间'),
  
  body('service')
    .notEmpty().withMessage('服务评分不能为空')
    .isFloat({ min: 0, max: 5 }).withMessage('服务评分必须在0-5之间'),
  
  body('price')
    .notEmpty().withMessage('价格评分不能为空')
    .isFloat({ min: 0, max: 5 }).withMessage('价格评分必须在0-5之间'),
  
  body('comments')
    .optional()
    .isString().withMessage('评价内容必须是字符串')
]);

// 记录交易验证
exports.validateRecordTransaction = validate([
  param('id')
    .isMongoId().withMessage('无效的供应商ID'),
  
  body('type')
    .notEmpty().withMessage('交易类型不能为空')
    .isIn(['purchase', 'payment', 'return']).withMessage('无效的交易类型'),
  
  body('amount')
    .notEmpty().withMessage('交易金额不能为空')
    .isFloat({ min: 0 }).withMessage('交易金额必须大于0'),
  
  body('project')
    .notEmpty().withMessage('项目不能为空')
    .isMongoId().withMessage('无效的项目ID'),
  
  body('document.type')
    .notEmpty().withMessage('单据类型不能为空')
    .isString().withMessage('单据类型必须是字符串'),
  
  body('document.number')
    .notEmpty().withMessage('单据编号不能为空')
    .isString().withMessage('单据编号必须是字符串')
]);

// 更新合作状态验证
exports.validateUpdateCooperationStatus = validate([
  param('id')
    .isMongoId().withMessage('无效的供应商ID'),
  
  body('status')
    .notEmpty().withMessage('合作状态不能为空')
    .isIn(['active', 'suspended', 'terminated']).withMessage('无效的合作状态')
]);

// 更新黑名单状态验证
exports.validateUpdateBlacklist = validate([
  param('id')
    .isMongoId().withMessage('无效的供应商ID'),
  
  body('isBlacklisted')
    .notEmpty().withMessage('黑名单状态不能为空')
    .isBoolean().withMessage('黑名单状态必须是布尔值'),
  
  body('reason')
    .if(body('isBlacklisted').equals('true'))
    .notEmpty().withMessage('加入黑名单时必须提供原因')
    .isString().withMessage('原因必须是字符串')
]);

// 查询供应商列表验证
exports.validateQuerySuppliers = validate([
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  
  query('category')
    .optional()
    .isIn(['material', 'equipment', 'service', 'contractor', 'other'])
    .withMessage('无效的供应商类别'),
  
  query('status')
    .optional()
    .isIn(['active', 'suspended', 'terminated'])
    .withMessage('无效的合作状态'),
  
  query('cooperationLevel')
    .optional()
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('无效的合作等级'),
  
  query('isBlacklisted')
    .optional()
    .isBoolean().withMessage('黑名单状态必须是布尔值'),
  
  query('hasExpiredDocs')
    .optional()
    .isBoolean().withMessage('过期文档筛选必须是布尔值'),
  
  query('search')
    .optional()
    .isString().withMessage('搜索关键词必须是字符串')
]);

// 添加资质验证
exports.validateAddQualification = validate([
  param('id')
    .isMongoId().withMessage('无效的供应商ID'),
  
  body('name')
    .notEmpty().withMessage('资质名称不能为空')
    .isString().withMessage('资质名称必须是字符串'),
  
  body('level')
    .notEmpty().withMessage('资质等级不能为空')
    .isString().withMessage('资质等级必须是字符串'),
  
  body('number')
    .notEmpty().withMessage('证书编号不能为空')
    .isString().withMessage('证书编号必须是字符串'),
  
  body('issueDate')
    .notEmpty().withMessage('发证日期不能为空')
    .isISO8601().withMessage('发证日期格式不正确'),
  
  body('expireDate')
    .notEmpty().withMessage('有效期不能为空')
    .isISO8601().withMessage('有效期格式不正确')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.issueDate)) {
        throw new Error('有效期必须晚于发证日期');
      }
      return true;
    })
]); 