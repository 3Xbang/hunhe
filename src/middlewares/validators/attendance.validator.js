/**
 * 考勤验证器
 */
const { body } = require('express-validator');
const { validate } = require('./validate');

exports.validateCheckIn = validate([
  body('project')
    .notEmpty()
    .withMessage('项目ID不能为空')
    .isMongoId()
    .withMessage('无效的项目ID'),

  body('location.coordinates')
    .isArray()
    .withMessage('位置坐标必须是数组')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('位置坐标必须包含经度和纬度');
      }
      const [longitude, latitude] = value;
      if (longitude < -180 || longitude > 180) {
        throw new Error('无效的经度值');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('无效的纬度值');
      }
      return true;
    }),

  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('地址不能为空'),

  body('device')
    .optional()
    .isIn(['mobile', 'web', 'biometric'])
    .withMessage('无效的设备类型'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

exports.validateCheckOut = validate([
  body('location.coordinates')
    .isArray()
    .withMessage('位置坐标必须是数组')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('位置坐标必须包含经度和纬度');
      }
      const [longitude, latitude] = value;
      if (longitude < -180 || longitude > 180) {
        throw new Error('无效的经度值');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('无效的纬度值');
      }
      return true;
    }),

  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('地址不能为空'),

  body('device')
    .optional()
    .isIn(['mobile', 'web', 'biometric'])
    .withMessage('无效的设备类型'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('备注不能超过500个字符')
]);

exports.validateWorkContent = validate([
  body('type')
    .trim()
    .notEmpty()
    .withMessage('工作类型不能为空')
    .isIn(['construction', 'inspection', 'maintenance', 'meeting', 'other'])
    .withMessage('无效的工作类型'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('工作描述不能为空')
    .isLength({ max: 1000 })
    .withMessage('工作描述不能超过1000个字符'),

  body('duration')
    .notEmpty()
    .withMessage('工作时长不能为空')
    .isFloat({ min: 0, max: 24 })
    .withMessage('工作时长必须在0-24小时之间'),

  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('工作地点不能为空')
]);

exports.validateBreak = validate([
  body('startTime')
    .notEmpty()
    .withMessage('开始时间不能为空')
    .isISO8601()
    .withMessage('无效的时间格式'),

  body('endTime')
    .notEmpty()
    .withMessage('结束时间不能为空')
    .isISO8601()
    .withMessage('无效的时间格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('结束时间必须晚于开始时间');
      }
      return true;
    }),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('休息类型不能为空')
    .isIn(['lunch', 'rest', 'other'])
    .withMessage('无效的休息类型')
]);

exports.validateLeaveInfo = validate([
  body('type')
    .trim()
    .notEmpty()
    .withMessage('请假类型不能为空')
    .isIn(['annual_leave', 'sick_leave', 'personal_leave', 'business_trip', 'other'])
    .withMessage('无效的请假类型'),

  body('startTime')
    .notEmpty()
    .withMessage('开始时间不能为空')
    .isISO8601()
    .withMessage('无效的时间格式'),

  body('endTime')
    .notEmpty()
    .withMessage('结束时间不能为空')
    .isISO8601()
    .withMessage('无效的时间格式')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('结束时间必须晚于开始时间');
      }
      return true;
    }),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('请假原因不能为空')
    .isLength({ max: 500 })
    .withMessage('请假原因不能超过500个字符')
]);

exports.validateException = validate([
  body('type')
    .trim()
    .notEmpty()
    .withMessage('异常类型不能为空')
    .isIn(['late', 'early_leave', 'missing_check_in', 'missing_check_out', 'location_mismatch', 'other'])
    .withMessage('无效的异常类型'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('异常描述不能为空')
    .isLength({ max: 500 })
    .withMessage('异常描述不能超过500个字符'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('异常原因不能为空')
    .isLength({ max: 500 })
    .withMessage('异常原因不能超过500个字符')
]); 