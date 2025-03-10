/**
 * 项目路由
 */
const express = require('express');
const multer = require('multer');
const projectController = require('../controllers/project.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateProject, validateProgress } = require('../middlewares/validators/project.validator');
const { ProjectProvider } = require('../providers/project.provider');
const { AppError } = require('../utils/appError');
const { upload } = require('../middlewares/upload');
const {
  validateCreateProject,
  validateUpdateProject,
  validateUpdateProgress,
  validateUpdateTeam,
  validateCreateMilestone,
  validateCreateRisk,
  validateAllocateResource,
  validateRecordCost,
  validateUploadDocument,
  validateProjectQuery
} = require('../middlewares/validators/project.validator');

const router = express.Router();
const projectProvider = new ProjectProvider();

/**
 * @api {post} /projects 创建项目
 * @apiName CreateProject
 * @apiGroup Project
 * @apiUse AuthHeader
 */
router.post(
  '/',
  authenticate,
  upload.array('attachments'),
  validateCreateProject,
  async (req, res, next) => {
    try {
      if (req.files) {
        req.body.attachments = req.files.map(file => ({
          name: file.originalname,
          file: file
        }));
      }

      const project = await projectProvider.createProject({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {get} /projects 获取项目列表
 */
router.get('/', authenticate, validateProjectQuery, async (req, res, next) => {
  try {
    const result = await projectProvider.getProjects(req.query);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @api {get} /projects/:id 获取项目详情
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const project = await projectProvider.getProject(req.params.id);
    res.json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @api {patch} /projects/:id 更新项目
 */
router.patch(
  '/:id',
  authenticate,
  upload.array('attachments'),
  validateUpdateProject,
  async (req, res, next) => {
    try {
      if (req.files) {
        req.body.attachments = req.files.map(file => ({
          name: file.originalname,
          file: file
        }));
      }

      const project = await projectProvider.updateProject(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user._id
        }
      );

      res.json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {delete} /projects/:id 删除项目
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await projectProvider.deleteProject(req.params.id);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 项目团队管理路由
 */
router.patch(
  '/:id/team',
  authenticate,
  validateUpdateTeam,
  async (req, res, next) => {
    try {
      const project = await projectProvider.updateProjectTeam(
        req.params.id,
        req.body
      );
      res.json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 项目进度管理路由
 */
router.patch(
  '/:id/progress',
  authenticate,
  validateUpdateProgress,
  async (req, res, next) => {
    try {
      const project = await projectProvider.updateProjectProgress(
        req.params.id,
        req.body
      );
      res.json({
        status: 'success',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 项目里程碑管理路由
 */
router.post(
  '/:id/milestones',
  authenticate,
  validateCreateMilestone,
  async (req, res, next) => {
    try {
      const milestone = await projectProvider.createMilestone(
        req.params.id,
        {
          ...req.body,
          createdBy: req.user._id
        }
      );
      res.status(201).json({
        status: 'success',
        data: { milestone }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/milestones', authenticate, async (req, res, next) => {
  try {
    const milestones = await projectProvider.getMilestones(req.params.id);
    res.json({
      status: 'success',
      data: { milestones }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 项目风险管理路由
 */
router.post(
  '/:id/risks',
  authenticate,
  validateCreateRisk,
  async (req, res, next) => {
    try {
      const risk = await projectProvider.createRisk(
        req.params.id,
        {
          ...req.body,
          createdBy: req.user._id
        }
      );
      res.status(201).json({
        status: 'success',
        data: { risk }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/risks', authenticate, async (req, res, next) => {
  try {
    const risks = await projectProvider.getRisks(req.params.id);
    res.json({
      status: 'success',
      data: { risks }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 项目资源分配路由
 */
router.post(
  '/:id/resources',
  authenticate,
  validateAllocateResource,
  async (req, res, next) => {
    try {
      const allocation = await projectProvider.allocateResource(
        req.params.id,
        {
          ...req.body,
          createdBy: req.user._id
        }
      );
      res.status(201).json({
        status: 'success',
        data: { allocation }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/resources', authenticate, async (req, res, next) => {
  try {
    const resources = await projectProvider.getResourceAllocations(req.params.id);
    res.json({
      status: 'success',
      data: { resources }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 项目成本管理路由
 */
router.post(
  '/:id/costs',
  authenticate,
  validateRecordCost,
  async (req, res, next) => {
    try {
      const cost = await projectProvider.recordCost(
        req.params.id,
        {
          ...req.body,
          createdBy: req.user._id
        }
      );
      res.status(201).json({
        status: 'success',
        data: { cost }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/costs', authenticate, async (req, res, next) => {
  try {
    const costs = await projectProvider.getCosts(req.params.id);
    res.json({
      status: 'success',
      data: { costs }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 项目文档管理路由
 */
router.post(
  '/:id/documents',
  authenticate,
  upload.single('file'),
  validateUploadDocument,
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('请上传文件', 400);
      }

      const document = await projectProvider.uploadDocument(
        req.params.id,
        {
          ...req.body,
          file: req.file,
          uploadedBy: req.user._id
        }
      );
      res.status(201).json({
        status: 'success',
        data: { document }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/documents', authenticate, async (req, res, next) => {
  try {
    const documents = await projectProvider.getDocuments(req.params.id);
    res.json({
      status: 'success',
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 项目报告生成路由
 */
router.get(
  '/:id/reports/:type',
  authenticate,
  async (req, res, next) => {
    try {
      const report = await projectProvider.generateReport(
        req.params.id,
        req.params.type
      );
      res.json({
        status: 'success',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 项目统计路由
 */
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const stats = await projectProvider.getProjectStats();
    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 