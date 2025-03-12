/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization Bearer token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 */

/**
 * @apiDefine SuccessResponse
 * @apiSuccess {String} status 响应状态
 * @apiSuccess {Object} data 响应数据
 */

/**
 * @apiDefine ErrorResponse
 * @apiError {String} status 错误状态
 * @apiError {String} message 错误信息
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "无效的请求参数"
 *     }
 */

/**
 * 安全管理路由
 * @module SecurityRoutes
 */
const express = require('express');
const router = express.Router();
const { SecurityProvider } = require('../providers/security.provider');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const {
  validateCreateRiskAssessment,
  validateUpdateRiskAssessment,
  validateReviewRiskAssessment,
  validateCreateIncident,
  validateUpdateIncident,
  validateReviewIncident,
  validateCreateInspection,
  validateUpdateInspection,
  validateReviewInspection,
  validateCreateTraining,
  validateUpdateTraining,
  validateRecordAttendance,
  validateRecordTest,
  validateEvaluateTraining
} = require('../middlewares/validators/security.validator');

const securityProvider = new SecurityProvider();

/**
 * @api {post} /risk-assessments 创建风险评估
 * @apiName CreateRiskAssessment
 * @apiGroup RiskAssessment
 * @apiUse AuthHeader
 * 
 * @apiParam {String} project 项目ID
 * @apiParam {String} code 评估编号
 * @apiParam {String} name 评估名称
 * @apiParam {String} type 评估类型 (routine/special/emergency/acceptance)
 * @apiParam {Object} [scope] 评估范围
 * @apiParam {String[]} [scope.areas] 评估区域
 * @apiParam {String[]} [scope.activities] 评估活动
 * @apiParam {String[]} [scope.personnel] 相关人员
 * @apiParam {Object[]} [risks] 风险项
 * @apiParam {String} risks.category 风险类别
 * @apiParam {String} risks.likelihood 可能性级别
 * @apiParam {String} risks.impact 影响级别
 * @apiParam {String} risks.level 风险等级
 * @apiParam {Date} plannedDate 计划评估日期
 * @apiParam {Object[]} [assessors] 评估人员
 * @apiParam {String} [notes] 备注
 * @apiParam {File[]} [attachments] 附件
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "project": "5f7b5d6c9b9b9b0012345678",
 *       "code": "RA-2024-001",
 *       "name": "施工现场安全风险评估",
 *       "type": "routine",
 *       "scope": {
 *         "areas": ["施工区域A", "施工区域B"],
 *         "activities": ["高空作业", "动火作业"],
 *         "personnel": ["施工人员", "安全员"]
 *       },
 *       "risks": [{
 *         "category": "personnel",
 *         "likelihood": "medium",
 *         "impact": "major",
 *         "level": "high"
 *       }],
 *       "plannedDate": "2024-03-20T00:00:00.000Z"
 *     }
 * 
 * @apiSuccess {Object} data.assessment 创建的风险评估
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "status": "success",
 *       "data": {
 *         "assessment": {
 *           "_id": "5f7b5d6c9b9b9b0012345679",
 *           "code": "RA-2024-001",
 *           "name": "施工现场安全风险评估",
 *           ...
 *         }
 *       }
 *     }
 * 
 * @apiUse ErrorResponse
 */
router.post(
  '/risk-assessments',
  authenticate,
  upload.array('attachments'),
  validateCreateRiskAssessment,
  async (req, res, next) => {
    try {
      // 处理上传的附件
      if (req.files) {
        req.body.attachments = req.files.map(file => ({
          name: file.originalname,
          file: file
        }));
      }

      const assessment = await securityProvider.createRiskAssessment({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { assessment }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {get} /risk-assessments 获取风险评估列表
 * @apiName GetRiskAssessments
 * @apiGroup RiskAssessment
 * @apiUse AuthHeader
 * 
 * @apiParam {String} [project] 项目ID
 * @apiParam {String} [type] 评估类型
 * @apiParam {String} [status] 评估状态
 * @apiParam {Date} [startDate] 开始日期
 * @apiParam {Date} [endDate] 结束日期
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 * @apiParam {String} [sortBy] 排序字段
 * 
 * @apiSuccess {Number} data.total 总记录数
 * @apiSuccess {Number} data.totalPages 总页数
 * @apiSuccess {Number} data.currentPage 当前页码
 * @apiSuccess {Object[]} data.assessments 风险评估列表
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "total": 50,
 *         "totalPages": 5,
 *         "currentPage": 1,
 *         "assessments": [{
 *           "_id": "5f7b5d6c9b9b9b0012345679",
 *           "code": "RA-2024-001",
 *           ...
 *         }]
 *       }
 *     }
 */
router.get('/risk-assessments', authenticate, async (req, res, next) => {
  try {
    const result = await securityProvider.getRiskAssessments(req.query);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @api {get} /risk-assessments/:id 获取单个风险评估
 * @apiName GetRiskAssessment
 * @apiGroup RiskAssessment
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 风险评估ID
 * 
 * @apiSuccess {Object} data.assessment 风险评估详情
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "assessment": {
 *           "_id": "5f7b5d6c9b9b9b0012345679",
 *           "code": "RA-2024-001",
 *           ...
 *         }
 *       }
 *     }
 */
router.get('/risk-assessments/:id', authenticate, async (req, res, next) => {
  try {
    const assessment = await securityProvider.getRiskAssessment(req.params.id);
    res.json({
      status: 'success',
      data: { assessment }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @api {patch} /risk-assessments/:id 更新风险评估
 * @apiName UpdateRiskAssessment
 * @apiGroup RiskAssessment
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 风险评估ID
 * @apiParam {String} [name] 评估名称
 * @apiParam {String} [type] 评估类型
 * @apiParam {Object} [scope] 评估范围
 * @apiParam {Object[]} [risks] 风险项
 * @apiParam {File[]} [attachments] 新增附件
 * 
 * @apiSuccess {Object} data.assessment 更新后的风险评估
 */
router.patch(
  '/risk-assessments/:id',
  authenticate,
  upload.array('attachments'),
  validateUpdateRiskAssessment,
  async (req, res, next) => {
    try {
      // 处理上传的附件
      if (req.files) {
        req.body.attachments = req.files.map(file => ({
          name: file.originalname,
          file: file
        }));
      }

      const assessment = await securityProvider.updateRiskAssessment(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { assessment }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {patch} /risk-assessments/:id/review 审核风险评估
 * @apiName ReviewRiskAssessment
 * @apiGroup RiskAssessment
 * @apiUse AuthHeader
 * 
 * @apiParam {String} id 风险评估ID
 * @apiParam {String} status 审核状态 (approved/rejected)
 * @apiParam {String} [comments] 审核意见
 * 
 * @apiSuccess {Object} data.assessment 审核后的风险评估
 */
router.patch(
  '/risk-assessments/:id/review',
  authenticate,
  validateReviewRiskAssessment,
  async (req, res, next) => {
    try {
      const assessment = await securityProvider.reviewRiskAssessment(
        req.params.id,
        {
          ...req.body,
          reviewedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { assessment }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {post} /incidents 创建安全事故
 * @apiName CreateIncident
 * @apiGroup Incident
 * @apiUse AuthHeader
 * 
 * @apiParam {String} project 项目ID
 * @apiParam {String} code 事故编号
 * @apiParam {String} type 事故类型
 * @apiParam {String} severity 事故等级
 * @apiParam {String} location 事故地点
 * @apiParam {Date} date 事故日期
 * @apiParam {String} description 事故描述
 * @apiParam {Object} [casualties] 伤亡情况
 * @apiParam {Object} [losses] 损失情况
 * @apiParam {File[]} [attachments] 附件
 */
router.post(
  '/incidents',
  authenticate,
  upload.array('attachments'),
  validateCreateIncident,
  async (req, res, next) => {
    try {
      // 处理上传的附件
      if (req.files) {
        req.body.attachments = req.files.map(file => ({
          name: file.originalname,
          file: file
        }));
      }

      const incident = await securityProvider.createIncident({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { incident }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取安全事故列表
router.get('/incidents', authenticate, async (req, res, next) => {
  try {
    const result = await securityProvider.getIncidents(req.query);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个安全事故
router.get('/incidents/:id', authenticate, async (req, res, next) => {
  try {
    const incident = await securityProvider.getIncident(req.params.id);
    res.json({
      status: 'success',
      data: { incident }
    });
  } catch (error) {
    next(error);
  }
});

// 更新安全事故
router.patch(
  '/incidents/:id',
  authenticate,
  upload.array('attachments'),
  validateUpdateIncident,
  async (req, res, next) => {
    try {
      // 处理上传的附件
      if (req.files) {
        req.body.attachments = req.files.map(file => ({
          name: file.originalname,
          file: file
        }));
      }

      const incident = await securityProvider.updateIncident(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { incident }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 审核安全事故
router.patch(
  '/incidents/:id/review',
  authenticate,
  validateReviewIncident,
  async (req, res, next) => {
    try {
      const incident = await securityProvider.reviewIncident(
        req.params.id,
        {
          ...req.body,
          reviewedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { incident }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 安全检查路由
 */
// 创建安全检查
router.post(
  '/inspections',
  authenticate,
  upload.array('attachments'),
  validateCreateInspection,
  async (req, res, next) => {
    try {
      // 处理上传的附件和照片
      if (req.files) {
        const attachments = [];
        const photos = [];

        req.files.forEach(file => {
          if (file.fieldname === 'attachments') {
            attachments.push({
              name: file.originalname,
              file: file
            });
          } else if (file.fieldname.startsWith('items[')) {
            // 解析照片所属的检查项索引
            const match = file.fieldname.match(/items\[(\d+)\]\.photos/);
            if (match) {
              const itemIndex = parseInt(match[1]);
              photos.push({
                itemIndex,
                photo: {
                  file: file,
                  description: req.body[`items[${itemIndex}].photos.description`]
                }
              });
            }
          }
        });

        if (attachments.length > 0) {
          req.body.attachments = attachments;
        }

        if (photos.length > 0) {
          // 确保 items 数组存在
          if (!req.body.items) {
            req.body.items = [];
          }

          // 将照片添加到对应的检查项中
          photos.forEach(({ itemIndex, photo }) => {
            if (!req.body.items[itemIndex]) {
              req.body.items[itemIndex] = {};
            }
            if (!req.body.items[itemIndex].photos) {
              req.body.items[itemIndex].photos = [];
            }
            req.body.items[itemIndex].photos.push(photo);
          });
        }
      }

      const inspection = await securityProvider.createInspection({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { inspection }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取安全检查列表
router.get('/inspections', authenticate, async (req, res, next) => {
  try {
    const result = await securityProvider.getInspections(req.query);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个安全检查
router.get('/inspections/:id', authenticate, async (req, res, next) => {
  try {
    const inspection = await securityProvider.getInspection(req.params.id);
    res.json({
      status: 'success',
      data: { inspection }
    });
  } catch (error) {
    next(error);
  }
});

// 更新安全检查
router.patch(
  '/inspections/:id',
  authenticate,
  upload.array('attachments'),
  validateUpdateInspection,
  async (req, res, next) => {
    try {
      // 处理上传的附件和照片
      if (req.files) {
        const attachments = [];
        const photos = [];

        req.files.forEach(file => {
          if (file.fieldname === 'attachments') {
            attachments.push({
              name: file.originalname,
              file: file
            });
          } else if (file.fieldname.startsWith('items[')) {
            const match = file.fieldname.match(/items\[(\d+)\]\.photos/);
            if (match) {
              const itemIndex = parseInt(match[1]);
              photos.push({
                itemIndex,
                photo: {
                  file: file,
                  description: req.body[`items[${itemIndex}].photos.description`]
                }
              });
            }
          }
        });

        if (attachments.length > 0) {
          req.body.attachments = attachments;
        }

        if (photos.length > 0) {
          if (!req.body.items) {
            req.body.items = [];
          }

          photos.forEach(({ itemIndex, photo }) => {
            if (!req.body.items[itemIndex]) {
              req.body.items[itemIndex] = {};
            }
            if (!req.body.items[itemIndex].photos) {
              req.body.items[itemIndex].photos = [];
            }
            req.body.items[itemIndex].photos.push(photo);
          });
        }
      }

      const inspection = await securityProvider.updateInspection(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { inspection }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 审核安全检查
router.patch(
  '/inspections/:id/review',
  authenticate,
  validateReviewInspection,
  async (req, res, next) => {
    try {
      const inspection = await securityProvider.reviewInspection(
        req.params.id,
        {
          ...req.body,
          reviewedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { inspection }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 安全培训路由
 */
// 创建安全培训
router.post(
  '/trainings',
  authenticate,
  upload.fields([
    { name: 'attachments', maxCount: 10 },
    { name: 'materials', maxCount: 10 }
  ]),
  validateCreateTraining,
  async (req, res, next) => {
    try {
      // 处理上传的附件和培训材料
      if (req.files) {
        if (req.files.attachments) {
          req.body.attachments = req.files.attachments.map(file => ({
            name: file.originalname,
            file: file
          }));
        }

        if (req.files.materials) {
          if (!req.body.content) {
            req.body.content = {};
          }
          req.body.content.materials = req.files.materials.map(file => ({
            name: file.originalname,
            file: file
          }));
        }
      }

      const training = await securityProvider.createTraining({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { training }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 获取安全培训列表
router.get('/trainings', authenticate, async (req, res, next) => {
  try {
    const result = await securityProvider.getTrainings(req.query);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个安全培训
router.get('/trainings/:id', authenticate, async (req, res, next) => {
  try {
    const training = await securityProvider.getTraining(req.params.id);
    res.json({
      status: 'success',
      data: { training }
    });
  } catch (error) {
    next(error);
  }
});

// 更新安全培训
router.patch(
  '/trainings/:id',
  authenticate,
  upload.fields([
    { name: 'attachments', maxCount: 10 },
    { name: 'materials', maxCount: 10 }
  ]),
  validateUpdateTraining,
  async (req, res, next) => {
    try {
      // 处理上传的附件和培训材料
      if (req.files) {
        if (req.files.attachments) {
          req.body.attachments = req.files.attachments.map(file => ({
            name: file.originalname,
            file: file
          }));
        }

        if (req.files.materials) {
          if (!req.body.content) {
            req.body.content = {};
          }
          req.body.content.materials = req.files.materials.map(file => ({
            name: file.originalname,
            file: file
          }));
        }
      }

      const training = await securityProvider.updateTraining(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { training }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 记录培训出勤
router.patch(
  '/trainings/:id/trainees/:traineeId/attendance',
  authenticate,
  validateRecordAttendance,
  async (req, res, next) => {
    try {
      const training = await securityProvider.recordTrainingAttendance(
        req.params.id,
        {
          traineeId: req.params.traineeId,
          attendance: req.body.attendance
        }
      );

      res.json({
        status: 'success',
        data: { training }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 记录培训考试
router.patch(
  '/trainings/:id/trainees/:traineeId/test',
  authenticate,
  validateRecordTest,
  async (req, res, next) => {
    try {
      const training = await securityProvider.recordTrainingTest(
        req.params.id,
        {
          traineeId: req.params.traineeId,
          ...req.body
        }
      );

      res.json({
        status: 'success',
        data: { training }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 评估培训
router.patch(
  '/trainings/:id/evaluate',
  authenticate,
  validateEvaluateTraining,
  async (req, res, next) => {
    try {
      const training = await securityProvider.evaluateTraining(
        req.params.id,
        req.body
      );

      res.json({
        status: 'success',
        data: { training }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {get} /stats 获取安全管理统计数据
 * @apiName GetSecurityStats
 * @apiGroup Statistics
 * @apiUse AuthHeader
 * 
 * @apiParam {String} [project] 项目ID
 * @apiParam {Date} [startDate] 开始日期
 * @apiParam {Date} [endDate] 结束日期
 * 
 * @apiSuccess {Object} data.stats 统计数据
 * @apiSuccess {Object} data.stats.riskStats 风险评估统计
 * @apiSuccess {Object} data.stats.incidentStats 事故统计
 * @apiSuccess {Object} data.stats.inspectionStats 检查统计
 * @apiSuccess {Object} data.stats.trainingStats 培训统计
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "stats": {
 *           "riskStats": [{
 *             "_id": { "type": "routine", "status": "completed" },
 *             "count": 10
 *           }],
 *           "incidentStats": [{
 *             "_id": { "type": "injury", "severity": "minor" },
 *             "count": 5,
 *             "deaths": 0,
 *             "injuries": 3
 *           }],
 *           "inspectionStats": [{
 *             "_id": { "type": "routine", "result": "pass" },
 *             "count": 20
 *           }],
 *           "trainingStats": [{
 *             "_id": { "type": "induction", "status": "completed" },
 *             "count": 15,
 *             "totalTrainees": 150,
 *             "totalDuration": 45
 *           }]
 *         }
 *       }
 *     }
 */
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const stats = await securityProvider.getSecurityStats(req.query);
    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 