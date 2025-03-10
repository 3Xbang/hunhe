/**
 * 质量管理路由
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const qualityProvider = require('../providers/quality.provider');
const {
  validateCreateStandard,
  validateUpdateStandard,
  validateStandardApproval,
  validateCreateInspection,
  validateUpdateInspection,
  validateInspectionReview,
  validateCreateIssue,
  validateUpdateIssue,
  validateIssueVerification,
  validateCreateImprovement,
  validateUpdateImprovement,
  validateImprovementEvaluation
} = require('../middlewares/validators/quality.validator');

// 质量标准路由
router.post(
  '/standards',
  auth,
  upload.array('attachments'),
  validateCreateStandard,
  async (req, res, next) => {
    try {
      const standard = await qualityProvider.createStandard({
        ...req.body,
        attachments: req.files
      });
      res.status(201).json(standard);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/standards', auth, async (req, res, next) => {
  try {
    const standards = await qualityProvider.getStandards(req.query);
    res.json(standards);
  } catch (error) {
    next(error);
  }
});

router.get('/standards/:id', auth, async (req, res, next) => {
  try {
    const standard = await qualityProvider.getStandard(req.params.id);
    res.json(standard);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/standards/:id',
  auth,
  upload.array('attachments'),
  validateUpdateStandard,
  async (req, res, next) => {
    try {
      const standard = await qualityProvider.updateStandard(req.params.id, {
        ...req.body,
        attachments: req.files
      });
      res.json(standard);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/standards/:id/approval',
  auth,
  validateStandardApproval,
  async (req, res, next) => {
    try {
      const standard = await qualityProvider.approveStandard(req.params.id, {
        ...req.body,
        approvedBy: req.user.id
      });
      res.json(standard);
    } catch (error) {
      next(error);
    }
  }
);

// 质量检查路由
router.post(
  '/inspections',
  auth,
  upload.array('attachments'),
  validateCreateInspection,
  async (req, res, next) => {
    try {
      const inspection = await qualityProvider.createInspection({
        ...req.body,
        attachments: req.files
      });
      res.status(201).json(inspection);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/inspections', auth, async (req, res, next) => {
  try {
    const inspections = await qualityProvider.getInspections(req.query);
    res.json(inspections);
  } catch (error) {
    next(error);
  }
});

router.get('/inspections/:id', auth, async (req, res, next) => {
  try {
    const inspection = await qualityProvider.getInspection(req.params.id);
    res.json(inspection);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/inspections/:id',
  auth,
  upload.array('attachments'),
  validateUpdateInspection,
  async (req, res, next) => {
    try {
      const inspection = await qualityProvider.updateInspection(req.params.id, {
        ...req.body,
        attachments: req.files
      });
      res.json(inspection);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/inspections/:id/review',
  auth,
  validateInspectionReview,
  async (req, res, next) => {
    try {
      const inspection = await qualityProvider.reviewInspection(req.params.id, {
        ...req.body,
        reviewedBy: req.user.id
      });
      res.json(inspection);
    } catch (error) {
      next(error);
    }
  }
);

// 质量问题路由
router.post(
  '/issues',
  auth,
  upload.array('attachments'),
  validateCreateIssue,
  async (req, res, next) => {
    try {
      const issue = await qualityProvider.createIssue({
        ...req.body,
        attachments: req.files,
        reportedBy: req.user.id
      });
      res.status(201).json(issue);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/issues', auth, async (req, res, next) => {
  try {
    const issues = await qualityProvider.getIssues(req.query);
    res.json(issues);
  } catch (error) {
    next(error);
  }
});

router.get('/issues/:id', auth, async (req, res, next) => {
  try {
    const issue = await qualityProvider.getIssue(req.params.id);
    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/issues/:id',
  auth,
  upload.array('attachments'),
  validateUpdateIssue,
  async (req, res, next) => {
    try {
      const issue = await qualityProvider.updateIssue(req.params.id, {
        ...req.body,
        attachments: req.files
      });
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/issues/:id/verify',
  auth,
  validateIssueVerification,
  async (req, res, next) => {
    try {
      const issue = await qualityProvider.verifyIssue(req.params.id, {
        ...req.body,
        verifiedBy: req.user.id
      });
      res.json(issue);
    } catch (error) {
      next(error);
    }
  }
);

// 改进措施路由
router.post(
  '/improvements',
  auth,
  upload.array('attachments'),
  validateCreateImprovement,
  async (req, res, next) => {
    try {
      const improvement = await qualityProvider.createImprovement({
        ...req.body,
        attachments: req.files,
        createdBy: req.user.id
      });
      res.status(201).json(improvement);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/improvements', auth, async (req, res, next) => {
  try {
    const improvements = await qualityProvider.getImprovements(req.query);
    res.json(improvements);
  } catch (error) {
    next(error);
  }
});

router.get('/improvements/:id', auth, async (req, res, next) => {
  try {
    const improvement = await qualityProvider.getImprovement(req.params.id);
    res.json(improvement);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/improvements/:id',
  auth,
  upload.array('attachments'),
  validateUpdateImprovement,
  async (req, res, next) => {
    try {
      const improvement = await qualityProvider.updateImprovement(req.params.id, {
        ...req.body,
        attachments: req.files
      });
      res.json(improvement);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/improvements/:id/evaluate',
  auth,
  validateImprovementEvaluation,
  async (req, res, next) => {
    try {
      const improvement = await qualityProvider.evaluateImprovement(req.params.id, {
        ...req.body,
        evaluatedBy: req.user.id
      });
      res.json(improvement);
    } catch (error) {
      next(error);
    }
  }
);

// 质量统计路由
router.get('/stats/project/:projectId', auth, async (req, res, next) => {
  try {
    const stats = await qualityProvider.getProjectQualityStats(req.params.projectId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 