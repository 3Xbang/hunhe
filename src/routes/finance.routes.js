/**
 * 财务管理路由
 */
const express = require('express');
const multer = require('multer');
const { FinanceProvider } = require('../providers/finance.provider');
const { authenticate } = require('../middlewares/auth');
const {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateTransactionStatus,
  validateTransactionApproval,
  validateCreateBudget,
  validateUpdateBudget,
  validateBudgetApproval
} = require('../middlewares/validators/finance.validator');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const financeProvider = new FinanceProvider();

/**
 * @route POST /api/v1/finance/transactions
 * @desc 创建交易记录
 * @access Private
 */
router.post('/transactions',
  authenticate,
  upload.fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'contract', maxCount: 1 }
  ]),
  validateCreateTransaction,
  async (req, res, next) => {
    try {
      const transaction = await financeProvider.createTransaction({
        ...req.body,
        createdBy: req.user.id,
        invoice: req.files?.invoice && {
          ...req.body.invoice,
          file: req.files.invoice[0]
        },
        contract: req.files?.contract && {
          ...req.body.contract,
          file: req.files.contract[0]
        }
      });
      res.status(201).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/finance/transactions
 * @desc 获取交易列表
 * @access Private
 */
router.get('/transactions', authenticate, async (req, res, next) => {
  try {
    const result = await financeProvider.getTransactions(req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/finance/transactions/:id
 * @desc 获取交易详情
 * @access Private
 */
router.get('/transactions/:id', authenticate, async (req, res, next) => {
  try {
    const transaction = await financeProvider.getTransaction(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/v1/finance/transactions/:id
 * @desc 更新交易记录
 * @access Private
 */
router.patch('/transactions/:id',
  authenticate,
  upload.fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'contract', maxCount: 1 }
  ]),
  validateUpdateTransaction,
  async (req, res, next) => {
    try {
      const transaction = await financeProvider.updateTransaction(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user.id,
          invoice: req.files?.invoice && {
            ...req.body.invoice,
            file: req.files.invoice[0]
          },
          contract: req.files?.contract && {
            ...req.body.contract,
            file: req.files.contract[0]
          }
        }
      );
      res.status(200).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/finance/transactions/:id/status
 * @desc 更新交易状态
 * @access Private
 */
router.patch('/transactions/:id/status',
  authenticate,
  validateTransactionStatus,
  async (req, res, next) => {
    try {
      const transaction = await financeProvider.updateTransactionStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );
      res.status(200).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/finance/transactions/:id/approval
 * @desc 审批交易
 * @access Private
 */
router.patch('/transactions/:id/approval',
  authenticate,
  validateTransactionApproval,
  async (req, res, next) => {
    try {
      const transaction = await financeProvider.approveTransaction(
        req.params.id,
        {
          ...req.body,
          approvedBy: req.user.id
        }
      );
      res.status(200).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/finance/budgets
 * @desc 创建预算
 * @access Private
 */
router.post('/budgets',
  authenticate,
  validateCreateBudget,
  async (req, res, next) => {
    try {
      const budget = await financeProvider.createBudget({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json({
        status: 'success',
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/finance/budgets
 * @desc 获取预算列表
 * @access Private
 */
router.get('/budgets', authenticate, async (req, res, next) => {
  try {
    const result = await financeProvider.getBudgets(req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/finance/budgets/:id
 * @desc 获取预算详情
 * @access Private
 */
router.get('/budgets/:id', authenticate, async (req, res, next) => {
  try {
    const budget = await financeProvider.getBudget(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/v1/finance/budgets/:id
 * @desc 更新预算
 * @access Private
 */
router.patch('/budgets/:id',
  authenticate,
  validateUpdateBudget,
  async (req, res, next) => {
    try {
      const budget = await financeProvider.updateBudget(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user.id
        }
      );
      res.status(200).json({
        status: 'success',
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/finance/budgets/:id/approval
 * @desc 审批预算
 * @access Private
 */
router.patch('/budgets/:id/approval',
  authenticate,
  validateBudgetApproval,
  async (req, res, next) => {
    try {
      const budget = await financeProvider.approveBudget(
        req.params.id,
        {
          ...req.body,
          approvedBy: req.user.id
        }
      );
      res.status(200).json({
        status: 'success',
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/finance/stats/project/:projectId
 * @desc 获取项目财务统计
 * @access Private
 */
router.get('/stats/project/:projectId', authenticate, async (req, res, next) => {
  try {
    const stats = await financeProvider.getProjectFinanceStats(
      req.params.projectId,
      req.query
    );
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 