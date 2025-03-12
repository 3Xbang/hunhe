/**
 * 设备管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('./validate');

// 创建设备验证
exports.validateCreateEquipment = validate([
  body('code')
    .notEmpty().withMessage('设备编号不能为空')
    .trim()
    .isString().withMessage('设备编号必须是字符串'),
  body('name')
    .notEmpty().withMessage('设备名称不能为空')
    .trim()
    .isString().withMessage('设备名称必须是字符串'),
  body('model')
    .notEmpty().withMessage('设备型号不能为空')
    .trim()
    .isString().withMessage('设备型号必须是字符串'),
  body('category')
    .notEmpty().withMessage('设备类别不能为空')
    .isIn(['machinery', 'electrical', 'measurement', 'safety', 'transportation', 'other'])
    .withMessage('无效的设备类别'),
  body('specifications')
    .optional()
    .isObject().withMessage('规格参数必须是对象'),
  body('location.site')
    .optional()
    .isString().withMessage('站点必须是字符串'),
  body('location.area')
    .optional()
    .isString().withMessage('区域必须是字符串'),
  body('location.position')
    .optional()
    .isString().withMessage('位置必须是字符串'),
  body('purchase.date')
    .optional()
    .isISO8601().withMessage('采购日期格式无效'),
  body('purchase.price')
    .optional()
    .isNumeric().withMessage('采购价格必须是数字'),
  body('maintenance.cycle')
    .optional()
    .isInt({ min: 1 }).withMessage('维护周期必须是大于0的整数')
]);

// 更新设备验证
exports.validateUpdateEquipment = validate([
  param('id')
    .isMongoId().withMessage('无效的设备ID'),
  body('name')
    .optional()
    .trim()
    .isString().withMessage('设备名称必须是字符串'),
  body('status')
    .optional()
    .isIn(['available', 'in_use', 'maintaining', 'repairing', 'scrapped'])
    .withMessage('无效的设备状态'),
  body('location')
    .optional()
    .isObject().withMessage('位置信息必须是对象'),
  body('maintenance')
    .optional()
    .isObject().withMessage('维护信息必须是对象')
]);

// 记录设备使用验证
exports.validateRecordUsage = validate([
  param('id')
    .isMongoId().withMessage('无效的设备ID'),
  body('project')
    .notEmpty().withMessage('项目ID不能为空')
    .isMongoId().withMessage('无效的项目ID'),
  body('startTime')
    .notEmpty().withMessage('开始时间不能为空')
    .isISO8601().withMessage('开始时间格式无效'),
  body('endTime')
    .optional()
    .isISO8601().withMessage('结束时间格式无效'),
  body('operator')
    .notEmpty().withMessage('操作员ID不能为空')
    .isMongoId().withMessage('无效的操作员ID'),
  body('purpose')
    .notEmpty().withMessage('使用目的不能为空')
    .trim()
    .isString().withMessage('使用目的必须是字符串')
]);

// 记录设备维护验证
exports.validateRecordMaintenance = validate([
  param('id')
    .isMongoId().withMessage('无效的设备ID'),
  body('type')
    .notEmpty().withMessage('维护类型不能为空')
    .isIn(['routine', 'repair', 'inspection'])
    .withMessage('无效的维护类型'),
  body('description')
    .notEmpty().withMessage('维护描述不能为空')
    .trim()
    .isString().withMessage('维护描述必须是字符串'),
  body('performer')
    .notEmpty().withMessage('执行人ID不能为空')
    .isMongoId().withMessage('无效的执行人ID'),
  body('parts')
    .optional()
    .isArray().withMessage('配件信息必须是数组'),
  body('parts.*.name')
    .optional()
    .isString().withMessage('配件名称必须是字符串'),
  body('parts.*.quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('配件数量必须是大于0的整数'),
  body('parts.*.cost')
    .optional()
    .isNumeric().withMessage('配件成本必须是数字')
]);

// 查询设备列表验证
exports.validateQueryEquipments = validate([
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('category')
    .optional()
    .isIn(['machinery', 'electrical', 'measurement', 'safety', 'transportation', 'other'])
    .withMessage('无效的设备类别'),
  query('status')
    .optional()
    .isIn(['available', 'in_use', 'maintaining', 'repairing', 'scrapped'])
    .withMessage('无效的设备状态'),
  query('search')
    .optional()
    .trim()
    .isString().withMessage('搜索关键词必须是字符串'),
  query('site')
    .optional()
    .trim()
    .isString().withMessage('站点必须是字符串')
]); 