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
const upload = require('../middlewares/upload');
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
const { checkRole } = require('../middlewares/role.middleware');

const router = express.Router();
const projectProvider = new ProjectProvider();

// 所有项目路由均需要身份验证
router.use(authenticate);

/**
 * @api {post} /projects 创建项目
 * @apiName CreateProject
 * @apiGroup Project
 * @apiUse AuthHeader
 */
router.post(
  '/',
  checkRole(['admin', 'manager']),
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
router.get('/', validateProjectQuery, async (req, res, next) => {
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
router.get('/:id', async (req, res, next) => {
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
  checkRole(['admin', 'manager']),
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
router.delete('/:id', checkRole(['admin']), async (req, res, next) => {
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
  checkRole(['admin', 'manager']),
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

router.delete(
  '/:id/team/:userId',
  checkRole(['admin', 'manager']),
  projectController.removeTeamMember
);

/**
 * 项目进度管理路由
 */
router.patch(
  '/:id/progress',
  checkRole(['admin', 'manager']),
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
  checkRole(['admin', 'manager']),
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

router.get('/:id/milestones', async (req, res, next) => {
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

router
  .route('/:id/milestones/:milestoneId')
  .patch(checkRole(['admin', 'manager']), projectController.updateMilestone)
  .delete(checkRole(['admin', 'manager']), projectController.deleteMilestone);

/**
 * 项目风险管理路由
 */
router.post(
  '/:id/risks',
  checkRole(['admin', 'manager']),
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

router.get('/:id/risks', async (req, res, next) => {
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
  checkRole(['admin', 'manager']),
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

router.get('/:id/resources', async (req, res, next) => {
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
  checkRole(['admin', 'manager']),
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

router.get('/:id/costs', async (req, res, next) => {
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
  checkRole(['admin', 'manager']),
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

router.get('/:id/documents', async (req, res, next) => {
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
router.get('/stats', async (req, res, next) => {
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