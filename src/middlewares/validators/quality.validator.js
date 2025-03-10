/**
 * 质量管理验证器
 */
const { body } = require('express-validator');
const { validate } = require('./validate');

// 质量标准验证
exports.validateCreateStandard = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('标准名称不能为空')
    .isLength({ max: 100 })
    .withMessage('标准名称不能超过100个字符'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('标准编号不能为空')
    .isLength({ max: 50 })
    .withMessage('标准编号不能超过50个字符'),

  body('category')
    .notEmpty()
    .withMessage('标准类别不能为空')
    .isIn(['material', 'construction', 'acceptance', 'safety', 'environmental', 'other'])
    .withMessage('无效的标准类别'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('version')
    .trim()
    .notEmpty()
    .withMessage('版本号不能为空')
    .isLength({ max: 20 })
    .withMessage('版本号不能超过20个字符'),

  body('effectiveDate')
    .notEmpty()
    .withMessage('生效日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.effectiveDate)) {
        throw new Error('失效日期必须晚于生效日期');
      }
      return true;
    }),

  body('requirements')
    .isArray()
    .withMessage('要求必须是数组'),

  body('requirements.*.item')
    .notEmpty()
    .withMessage('要求项目不能为空')
    .isLength({ max: 100 })
    .withMessage('要求项目不能超过100个字符'),

  body('requirements.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('要求描述不能超过500个字符'),

  body('requirements.*.acceptanceCriteria')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('验收标准不能超过500个字符'),

  body('applicableProjects')
    .optional()
    .isArray()
    .withMessage('适用项目必须是数组'),

  body('applicableProjects.*')
    .optional()
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('applicableMaterials')
    .optional()
    .isArray()
    .withMessage('适用材料必须是数组'),

  body('applicableMaterials.*')
    .optional()
    .isMongoId()
    .withMessage('无效的材料ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateStandard = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('标准名称不能为空')
    .isLength({ max: 100 })
    .withMessage('标准名称不能超过100个字符'),

  // ... 其他字段的验证规则与 validateCreateStandard 相同，但都是可选的
]);

exports.validateStandardApproval = validate([
  body('status')
    .notEmpty()
    .withMessage('审批状态不能为空')
    .isIn(['active', 'rejected'])
    .withMessage('无效的审批状态'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审批备注不能超过500个字符')
]);

// 质量检查验证
exports.validateCreateInspection = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('type')
    .notEmpty()
    .withMessage('检查类型不能为空')
    .isIn(['material', 'construction', 'acceptance', 'safety', 'environmental', 'other'])
    .withMessage('无效的检查类型'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('检查名称不能为空')
    .isLength({ max: 100 })
    .withMessage('检查名称不能超过100个字符'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('位置不能超过100个字符'),

  body('standards')
    .isArray()
    .withMessage('检查标准必须是数组'),

  body('standards.*.standard')
    .notEmpty()
    .withMessage('标准ID不能为空')
    .isMongoId()
    .withMessage('无效的标准ID'),

  body('standards.*.requirements')
    .optional()
    .isArray()
    .withMessage('检查要求必须是数组'),

  body('standards.*.requirements.*.result')
    .optional()
    .isIn(['pass', 'fail', 'na'])
    .withMessage('无效的检查结果'),

  body('materials')
    .optional()
    .isArray()
    .withMessage('材料必须是数组'),

  body('materials.*.material')
    .optional()
    .isMongoId()
    .withMessage('无效的材料ID'),

  body('materials.*.quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('数量必须是正数'),

  body('equipment')
    .optional()
    .isArray()
    .withMessage('设备必须是数组'),

  body('equipment.*.equipment')
    .optional()
    .isMongoId()
    .withMessage('无效的设备ID'),

  body('result')
    .notEmpty()
    .withMessage('检查结果不能为空')
    .isIn(['pass', 'conditional_pass', 'fail'])
    .withMessage('无效的检查结果'),

  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('分数必须是0-100之间的整数'),

  body('findings')
    .optional()
    .isArray()
    .withMessage('发现问题必须是数组'),

  body('findings.*.description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('问题描述不能为空')
    .isLength({ max: 500 })
    .withMessage('问题描述不能超过500个字符'),

  body('findings.*.severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('无效的严重程度'),

  body('inspector')
    .notEmpty()
    .withMessage('检查人不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('participants')
    .optional()
    .isArray()
    .withMessage('参与人必须是数组'),

  body('participants.*')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('plannedDate')
    .notEmpty()
    .withMessage('计划检查日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('检查时长必须是正整数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateInspection = validate([
  body('type')
    .optional()
    .isIn(['material', 'construction', 'acceptance', 'safety', 'environmental', 'other'])
    .withMessage('无效的检查类型'),

  // ... 其他字段的验证规则与 validateCreateInspection 相同，但都是可选的
]);

exports.validateInspectionReview = validate([
  body('reviewNotes')
    .trim()
    .notEmpty()
    .withMessage('审核意见不能为空')
    .isLength({ max: 500 })
    .withMessage('审核意见不能超过500个字符')
]);

// 质量问题验证
exports.validateCreateIssue = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('type')
    .notEmpty()
    .withMessage('问题类型不能为空')
    .isIn(['material', 'construction', 'design', 'equipment', 'environmental', 'other'])
    .withMessage('无效的问题类型'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('问题标题不能为空')
    .isLength({ max: 100 })
    .withMessage('问题标题不能超过100个字符'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('问题描述不能为空')
    .isLength({ max: 500 })
    .withMessage('问题描述不能超过500个字符'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('位置不能超过100个字符'),

  body('severity')
    .notEmpty()
    .withMessage('严重程度不能为空')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('无效的严重程度'),

  body('impact')
    .optional()
    .isObject()
    .withMessage('影响必须是对象'),

  body('rootCause')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('根本原因不能超过500个字符'),

  body('preventiveMeasures')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('预防措施不能超过500个字符'),

  body('assignedTo')
    .notEmpty()
    .withMessage('处理人不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('deadline')
    .notEmpty()
    .withMessage('处理期限不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateIssue = validate([
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('问题标题不能为空')
    .isLength({ max: 100 })
    .withMessage('问题标题不能超过100个字符'),

  // ... 其他字段的验证规则与 validateCreateIssue 相同，但都是可选的
]);

exports.validateIssueVerification = validate([
  body('result')
    .notEmpty()
    .withMessage('验证结果不能为空')
    .isIn(['accepted', 'rejected'])
    .withMessage('无效的验证结果'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('验证备注不能超过500个字符')
]);

// 改进措施验证
exports.validateCreateImprovement = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('type')
    .notEmpty()
    .withMessage('改进类型不能为空')
    .isIn(['process', 'technology', 'management', 'training', 'other'])
    .withMessage('无效的改进类型'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('改进标题不能为空')
    .isLength({ max: 100 })
    .withMessage('改进标题不能超过100个字符'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('改进描述不能为空')
    .isLength({ max: 500 })
    .withMessage('改进描述不能超过500个字符'),

  body('objectives')
    .isArray()
    .withMessage('改进目标必须是数组'),

  body('objectives.*.description')
    .notEmpty()
    .withMessage('目标描述不能为空')
    .isLength({ max: 200 })
    .withMessage('目标描述不能超过200个字符'),

  body('actions')
    .isArray()
    .withMessage('实施计划必须是数组'),

  body('actions.*.description')
    .notEmpty()
    .withMessage('行动描述不能为空')
    .isLength({ max: 200 })
    .withMessage('行动描述不能超过200个字符'),

  body('actions.*.assignedTo')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('plannedStartDate')
    .notEmpty()
    .withMessage('计划开始日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('plannedEndDate')
    .notEmpty()
    .withMessage('计划结束日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.plannedStartDate)) {
        throw new Error('计划结束日期必须晚于计划开始日期');
      }
      return true;
    }),

  body('responsiblePerson')
    .notEmpty()
    .withMessage('负责人不能为空')
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('team')
    .optional()
    .isArray()
    .withMessage('团队成员必须是数组'),

  body('team.*')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('resources.budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预算必须是正数'),

  body('resources.manpower')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('人力必须是正数'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateImprovement = validate([
  body('type')
    .optional()
    .isIn(['process', 'technology', 'management', 'training', 'other'])
    .withMessage('无效的改进类型'),

  // ... 其他字段的验证规则与 validateCreateImprovement 相同，但都是可选的
]);

exports.validateImprovementEvaluation = validate([
  body('effectiveness')
    .notEmpty()
    .withMessage('有效性评估不能为空')
    .isIn(['low', 'medium', 'high'])
    .withMessage('无效的有效性评估'),

  body('costEfficiency')
    .notEmpty()
    .withMessage('成本效益评估不能为空')
    .isIn(['low', 'medium', 'high'])
    .withMessage('无效的成本效益评估'),

  body('sustainability')
    .notEmpty()
    .withMessage('可持续性评估不能为空')
    .isIn(['low', 'medium', 'high'])
    .withMessage('无效的可持续性评估'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('评估意见不能超过500个字符')
]); 