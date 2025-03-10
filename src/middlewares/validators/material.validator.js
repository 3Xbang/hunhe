/**
 * 材料管理验证器
 */
const { body, query, param } = require('express-validator');
const { validate } = require('../validate');

// 创建材料验证
exports.validateCreateMaterial = validate([
  body('code')
    .notEmpty().withMessage('材料编号不能为空')
    .trim()
    .isString().withMessage('材料编号必须是字符串'),
  body('name')
    .notEmpty().withMessage('材料名称不能为空')
    .trim()
    .isString().withMessage('材料名称必须是字符串'),
  body('category')
    .notEmpty().withMessage('材料类别不能为空')
    .isIn(['steel', 'concrete', 'wood', 'brick', 'paint', 'electrical', 'plumbing', 'other'])
    .withMessage('无效的材料类别'),
  body('specification')
    .notEmpty().withMessage('规格型号不能为空')
    .trim()
    .isString().withMessage('规格型号必须是字符串'),
  body('unit')
    .notEmpty().withMessage('计量单位不能为空')
    .trim()
    .isString().withMessage('计量单位必须是字符串'),
  body('stock.quantity')
    .notEmpty().withMessage('库存数量不能为空')
    .isFloat({ min: 0 }).withMessage('库存数量必须是非负数'),
  body('stock.minLimit')
    .notEmpty().withMessage('最小库存限制不能为空')
    .isFloat({ min: 0 }).withMessage('最小库存限制必须是非负数'),
  body('stock.maxLimit')
    .notEmpty().withMessage('最大库存限制不能为空')
    .isFloat({ min: 0 }).withMessage('最大库存限制必须是非负数'),
  body('price.unit')
    .notEmpty().withMessage('单价不能为空')
    .isFloat({ min: 0 }).withMessage('单价必须是非负数'),
  body('supplier')
    .notEmpty().withMessage('供应商不能为空')
    .isMongoId().withMessage('无效的供应商ID')
]);

// 更新材料验证
exports.validateUpdateMaterial = validate([
  param('id')
    .isMongoId().withMessage('无效的材料ID'),
  body('name')
    .optional()
    .trim()
    .isString().withMessage('材料名称必须是字符串'),
  body('specification')
    .optional()
    .trim()
    .isString().withMessage('规格型号必须是字符串'),
  body('stock.minLimit')
    .optional()
    .isFloat({ min: 0 }).withMessage('最小库存限制必须是非负数'),
  body('stock.maxLimit')
    .optional()
    .isFloat({ min: 0 }).withMessage('最大库存限制必须是非负数'),
  body('price.unit')
    .optional()
    .isFloat({ min: 0 }).withMessage('单价必须是非负数')
]);

// 入库验证
exports.validateInbound = validate([
  param('id')
    .isMongoId().withMessage('无效的材料ID'),
  body('quantity')
    .notEmpty().withMessage('入库数量不能为空')
    .isFloat({ min: 0.01 }).withMessage('入库数量必须大于0'),
  body('batchNo')
    .optional()
    .trim()
    .isString().withMessage('批次号必须是字符串'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('价格必须是非负数'),
  body('supplier')
    .notEmpty().withMessage('供应商不能为空')
    .isMongoId().withMessage('无效的供应商ID'),
  body('document')
    .notEmpty().withMessage('单据类型不能为空')
    .isIn(['purchase_order', 'return_order', 'transfer_order'])
    .withMessage('无效的单据类型'),
  body('documentNo')
    .notEmpty().withMessage('单据编号不能为空')
    .trim()
    .isString().withMessage('单据编号必须是字符串')
]);

// 出库验证
exports.validateOutbound = validate([
  param('id')
    .isMongoId().withMessage('无效的材料ID'),
  body('quantity')
    .notEmpty().withMessage('出库数量不能为空')
    .isFloat({ min: 0.01 }).withMessage('出库数量必须大于0'),
  body('project')
    .notEmpty().withMessage('项目不能为空')
    .isMongoId().withMessage('无效的项目ID'),
  body('requestedBy')
    .notEmpty().withMessage('申请人不能为空')
    .isMongoId().withMessage('无效的申请人ID'),
  body('document')
    .notEmpty().withMessage('单据类型不能为空')
    .isIn(['material_request', 'return_order', 'transfer_order'])
    .withMessage('无效的单据类型'),
  body('documentNo')
    .notEmpty().withMessage('单据编号不能为空')
    .trim()
    .isString().withMessage('单据编号必须是字符串')
]);

// 查询材料列表验证
exports.validateQueryMaterials = validate([
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('category')
    .optional()
    .isIn(['steel', 'concrete', 'wood', 'brick', 'paint', 'electrical', 'plumbing', 'other'])
    .withMessage('无效的材料类别'),
  query('status')
    .optional()
    .isIn(['active', 'low_stock', 'out_stock', 'discontinued'])
    .withMessage('无效的状态'),
  query('supplier')
    .optional()
    .isMongoId().withMessage('无效的供应商ID'),
  query('minStock')
    .optional()
    .isFloat({ min: 0 }).withMessage('最小库存必须是非负数'),
  query('maxStock')
    .optional()
    .isFloat({ min: 0 }).withMessage('最大库存必须是非负数'),
  query('search')
    .optional()
    .trim()
    .isString().withMessage('搜索关键词必须是字符串')
]); 