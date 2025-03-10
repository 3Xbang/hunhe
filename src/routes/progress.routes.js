/**
 * 进度管理路由
 */
const express = require('express');
const multer = require('multer');
const { ProgressProvider } = require('../providers/progress.provider');
const { auth } = require('../middlewares/auth');
const {
  validateCreateMilestone,
  validateUpdateMilestone,
  validateCreateTask,
  validateUpdateTask,
  validateTaskProgress,
  validateTaskIssue,
  validateTaskIssueResolution
} = require('../middlewares/validators/progress.validator');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const progressProvider = new ProgressProvider();

/**
 * @route POST /api/v1/progress/milestones
 * @desc 创建里程碑
 * @access Private
 */
router.post('/milestones',
  auth,
  upload.array('attachments'),
  validateCreateMilestone,
  async (req, res, next) => {
    try {
      const milestone = await progressProvider.createMilestone({
        ...req.body,
        createdBy: req.user.id,
        attachments: req.files?.map(file => ({
          file,
          uploadedBy: req.user.id
        }))
      });
      res.status(201).json({
        status: 'success',
        data: { milestone }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/progress/milestones
 * @desc 获取里程碑列表
 * @access Private
 */
router.get('/milestones', auth, async (req, res, next) => {
  try {
    const result = await progressProvider.getMilestones(req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/progress/milestones/:id
 * @desc 获取里程碑详情
 * @access Private
 */
router.get('/milestones/:id', auth, async (req, res, next) => {
  try {
    const milestone = await progressProvider.getMilestone(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { milestone }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/v1/progress/milestones/:id
 * @desc 更新里程碑
 * @access Private
 */
router.patch('/milestones/:id',
  auth,
  upload.array('attachments'),
  validateUpdateMilestone,
  async (req, res, next) => {
    try {
      const milestone = await progressProvider.updateMilestone(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user.id,
          attachments: req.files?.map(file => ({
            file,
            uploadedBy: req.user.id
          }))
        }
      );
      res.status(200).json({
        status: 'success',
        data: { milestone }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/progress/milestones/:id/progress
 * @desc 更新里程碑进度
 * @access Private
 */
router.patch('/milestones/:id/progress',
  auth,
  validateTaskProgress,
  async (req, res, next) => {
    try {
      const milestone = await progressProvider.updateMilestoneProgress(
        req.params.id,
        req.body.progress
      );
      res.status(200).json({
        status: 'success',
        data: { milestone }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/progress/tasks
 * @desc 创建任务
 * @access Private
 */
router.post('/tasks',
  auth,
  upload.array('attachments'),
  validateCreateTask,
  async (req, res, next) => {
    try {
      const task = await progressProvider.createTask({
        ...req.body,
        createdBy: req.user.id,
        attachments: req.files?.map(file => ({
          file,
          uploadedBy: req.user.id
        }))
      });
      res.status(201).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/progress/tasks
 * @desc 获取任务列表
 * @access Private
 */
router.get('/tasks', auth, async (req, res, next) => {
  try {
    const result = await progressProvider.getTasks(req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/progress/tasks/:id
 * @desc 获取任务详情
 * @access Private
 */
router.get('/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await progressProvider.getTask(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/v1/progress/tasks/:id
 * @desc 更新任务
 * @access Private
 */
router.patch('/tasks/:id',
  auth,
  upload.array('attachments'),
  validateUpdateTask,
  async (req, res, next) => {
    try {
      const task = await progressProvider.updateTask(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user.id,
          attachments: req.files?.map(file => ({
            file,
            uploadedBy: req.user.id
          }))
        }
      );
      res.status(200).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/progress/tasks/:id/progress
 * @desc 更新任务进度
 * @access Private
 */
router.patch('/tasks/:id/progress',
  auth,
  validateTaskProgress,
  async (req, res, next) => {
    try {
      const task = await progressProvider.updateTaskProgress(
        req.params.id,
        req.body.progress
      );
      res.status(200).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/progress/tasks/:id/issues
 * @desc 添加任务问题
 * @access Private
 */
router.post('/tasks/:id/issues',
  auth,
  validateTaskIssue,
  async (req, res, next) => {
    try {
      const task = await progressProvider.addTaskIssue(
        req.params.id,
        {
          ...req.body,
          reportedBy: req.user.id
        }
      );
      res.status(201).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/progress/tasks/:taskId/issues/:issueId/resolve
 * @desc 解决任务问题
 * @access Private
 */
router.patch('/tasks/:taskId/issues/:issueId/resolve',
  auth,
  validateTaskIssueResolution,
  async (req, res, next) => {
    try {
      const task = await progressProvider.resolveTaskIssue(
        req.params.taskId,
        req.params.issueId,
        {
          ...req.body,
          resolvedBy: req.user.id
        }
      );
      res.status(200).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/progress/stats/project/:projectId
 * @desc 获取项目进度统计
 * @access Private
 */
router.get('/stats/project/:projectId', auth, async (req, res, next) => {
  try {
    const stats = await progressProvider.getProjectProgressStats(req.params.projectId);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 