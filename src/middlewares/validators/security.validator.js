/**
 * 安全管理验证器
 */
const { body } = require('express-validator');
const { validate } = require('./validate');

// 风险评估验证
exports.validateCreateRiskAssessment = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('评估编号不能为空')
    .isLength({ max: 50 })
    .withMessage('评估编号不能超过50个字符'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('评估名称不能为空')
    .isLength({ max: 100 })
    .withMessage('评估名称不能超过100个字符'),

  body('type')
    .notEmpty()
    .withMessage('评估类型不能为空')
    .isIn(['routine', 'special', 'emergency', 'acceptance'])
    .withMessage('无效的评估类型'),

  body('scope.areas')
    .optional()
    .isArray()
    .withMessage('评估区域必须是数组'),

  body('scope.activities')
    .optional()
    .isArray()
    .withMessage('评估活动必须是数组'),

  body('scope.personnel')
    .optional()
    .isArray()
    .withMessage('相关人员必须是数组'),

  body('risks')
    .optional()
    .isArray()
    .withMessage('风险项必须是数组'),

  body('risks.*.category')
    .optional()
    .isIn(['personnel', 'equipment', 'environment', 'operation', 'material', 'other'])
    .withMessage('无效的风险类别'),

  body('risks.*.likelihood')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('无效的可能性级别'),

  body('risks.*.impact')
    .optional()
    .isIn(['minor', 'moderate', 'major', 'critical'])
    .withMessage('无效的影响级别'),

  body('risks.*.level')
    .optional()
    .isIn(['low', 'medium', 'high', 'extreme'])
    .withMessage('无效的风险等级'),

  body('plannedDate')
    .notEmpty()
    .withMessage('计划评估日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('assessors')
    .optional()
    .isArray()
    .withMessage('评估人员必须是数组'),

  body('assessors.*.user')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateRiskAssessment = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('评估名称不能为空')
    .isLength({ max: 100 })
    .withMessage('评估名称不能超过100个字符'),

  // ... 其他字段的验证规则与 validateCreateRiskAssessment 相同，但都是可选的
]);

exports.validateReviewRiskAssessment = validate([
  body('status')
    .notEmpty()
    .withMessage('审核状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审核状态'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审核意见不能超过500个字符')
]);

// 安全事故验证
exports.validateCreateIncident = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('事故编号不能为空')
    .isLength({ max: 50 })
    .withMessage('事故编号不能超过50个字符'),

  body('type')
    .notEmpty()
    .withMessage('事故类型不能为空')
    .isIn(['injury', 'equipment', 'fire', 'explosion', 'spill', 'collapse', 'electric', 'other'])
    .withMessage('无效的事故类型'),

  body('severity')
    .notEmpty()
    .withMessage('事故等级不能为空')
    .isIn(['minor', 'moderate', 'major', 'critical'])
    .withMessage('无效的事故等级'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('事故地点不能为空')
    .isLength({ max: 200 })
    .withMessage('事故地点不能超过200个字符'),

  body('date')
    .notEmpty()
    .withMessage('事故日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('事故描述不能为空')
    .isLength({ max: 1000 })
    .withMessage('事故描述不能超过1000个字符'),

  body('casualties.deaths')
    .optional()
    .isInt({ min: 0 })
    .withMessage('死亡人数必须是非负整数'),

  body('casualties.injuries')
    .optional()
    .isInt({ min: 0 })
    .withMessage('受伤人数必须是非负整数'),

  body('losses.direct')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('直接经济损失必须是非负数'),

  body('losses.indirect')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('间接经济损失必须是非负数'),

  body('investigation.team')
    .optional()
    .isArray()
    .withMessage('调查组必须是数组'),

  body('investigation.team.*.user')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateIncident = validate([
  body('type')
    .optional()
    .isIn(['injury', 'equipment', 'fire', 'explosion', 'spill', 'collapse', 'electric', 'other'])
    .withMessage('无效的事故类型'),

  // ... 其他字段的验证规则与 validateCreateIncident 相同，但都是可选的
]);

exports.validateReviewIncident = validate([
  body('status')
    .notEmpty()
    .withMessage('审核状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审核状态'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审核意见不能超过500个字符')
]);

// 安全检查验证
exports.validateCreateInspection = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('检查编号不能为空')
    .isLength({ max: 50 })
    .withMessage('检查编号不能超过50个字符'),

  body('type')
    .notEmpty()
    .withMessage('检查类型不能为空')
    .isIn(['routine', 'special', 'random', 'followup'])
    .withMessage('无效的检查类型'),

  body('scope.areas')
    .optional()
    .isArray()
    .withMessage('检查区域必须是数组'),

  body('scope.items')
    .optional()
    .isArray()
    .withMessage('检查项目必须是数组'),

  body('scope.standards')
    .optional()
    .isArray()
    .withMessage('检查标准必须是数组'),

  body('items')
    .optional()
    .isArray()
    .withMessage('检查结果必须是数组'),

  body('items.*.result')
    .optional()
    .isIn(['pass', 'fail', 'na'])
    .withMessage('无效的检查结果'),

  body('plannedDate')
    .notEmpty()
    .withMessage('计划检查日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('inspectors')
    .optional()
    .isArray()
    .withMessage('检查人员必须是数组'),

  body('inspectors.*.user')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateInspection = validate([
  body('type')
    .optional()
    .isIn(['routine', 'special', 'random', 'followup'])
    .withMessage('无效的检查类型'),

  // ... 其他字段的验证规则与 validateCreateInspection 相同，但都是可选的
]);

exports.validateReviewInspection = validate([
  body('status')
    .notEmpty()
    .withMessage('审核状态不能为空')
    .isIn(['approved', 'rejected'])
    .withMessage('无效的审核状态'),

  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('审核意见不能超过500个字符')
]);

// 安全培训验证
exports.validateCreateTraining = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('培训编号不能为空')
    .isLength({ max: 50 })
    .withMessage('培训编号不能超过50个字符'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('培训名称不能为空')
    .isLength({ max: 100 })
    .withMessage('培训名称不能超过100个字符'),

  body('type')
    .notEmpty()
    .withMessage('培训类型不能为空')
    .isIn(['induction', 'regular', 'special', 'certification'])
    .withMessage('无效的培训类型'),

  body('content.topics')
    .optional()
    .isArray()
    .withMessage('培训主题必须是数组'),

  body('content.objectives')
    .optional()
    .isArray()
    .withMessage('培训目标必须是数组'),

  body('schedule.startDate')
    .notEmpty()
    .withMessage('培训开始日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式'),

  body('schedule.endDate')
    .notEmpty()
    .withMessage('培训结束日期不能为空')
    .isISO8601()
    .withMessage('无效的日期格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.schedule.startDate)) {
        throw new Error('结束日期必须晚于开始日期');
      }
      return true;
    }),

  body('schedule.duration')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('培训时长必须是非负数'),

  body('trainers')
    .optional()
    .isArray()
    .withMessage('培训人员必须是数组'),

  body('trainers.*.user')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('trainees')
    .optional()
    .isArray()
    .withMessage('参训人员必须是数组'),

  body('trainees.*.user')
    .optional()
    .isMongoId()
    .withMessage('无效的用户ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('备注不能超过1000个字符')
]);

exports.validateUpdateTraining = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('培训名称不能为空')
    .isLength({ max: 100 })
    .withMessage('培训名称不能超过100个字符'),

  // ... 其他字段的验证规则与 validateCreateTraining 相同，但都是可选的
]);

exports.validateRecordAttendance = validate([
  body('attendance')
    .notEmpty()
    .withMessage('出勤状态不能为空')
    .isIn(['present', 'absent', 'late'])
    .withMessage('无效的出勤状态')
]);

exports.validateRecordTest = validate([
  body('score')
    .notEmpty()
    .withMessage('考试分数不能为空')
    .isFloat({ min: 0, max: 100 })
    .withMessage('考试分数必须在0-100之间'),

  body('result')
    .notEmpty()
    .withMessage('考试结果不能为空')
    .isIn(['pass', 'fail'])
    .withMessage('无效的考试结果'),

  body('certificate.number')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('证书编号不能超过50个字符'),

  body('certificate.issueDate')
    .optional()
    .isISO8601()
    .withMessage('无效的发证日期格式'),

  body('certificate.expiryDate')
    .optional()
    .isISO8601()
    .withMessage('无效的到期日期格式')
    .custom((value, { req }) => {
      if (req.body.certificate?.issueDate && new Date(value) <= new Date(req.body.certificate.issueDate)) {
        throw new Error('到期日期必须晚于发证日期');
      }
      return true;
    })
]);

exports.validateEvaluateTraining = validate([
  body('satisfaction')
    .notEmpty()
    .withMessage('满意度评分不能为空')
    .isFloat({ min: 0, max: 5 })
    .withMessage('满意度评分必须在0-5之间'),

  body('effectiveness')
    .notEmpty()
    .withMessage('有效性评分不能为空')
    .isFloat({ min: 0, max: 5 })
    .withMessage('有效性评分必须在0-5之间'),

  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('反馈意见不能超过500个字符'),

  body('improvements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('改进建议不能超过500个字符')
]); 