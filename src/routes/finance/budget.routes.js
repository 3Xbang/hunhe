/**
 * 预算管理路由
 */
const express = require('express');
const router = express.Router();
const budgetProvider = require('../../providers/finance/budget.provider');
const { auth, roles } = require('../../middlewares/auth');
const {
  validateCreateBudget,
  validateUpdateBudget,
  validateApproveBudget,
  validateQueryBudgets
} = require('../../middlewares/validators/finance/budget.validator');

// 创建预算
router.post('/',
  auth,
  roles(['admin', 'finance_manager']),
  validateCreateBudget,
  async (req, res, next) => {
    try {
      const budget = await budgetProvider.createBudget({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json(budget);
    } catch (error) {
      next(error);
    }
  }
);

// 获取预算列表
router.get('/',
  auth,
  validateQueryBudgets,
  async (req, res, next) => {
    try {
      const budgets = await budgetProvider.getBudgets(req.query);
      res.json(budgets);
    } catch (error) {
      next(error);
    }
  }
);

// 获取预算详情
router.get('/:id',
  auth,
  async (req, res, next) => {
    try {
      const budget = await budgetProvider.getBudget(req.params.id);
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }
);

// 更新预算
router.patch('/:id',
  auth,
  roles(['admin', 'finance_manager']),
  validateUpdateBudget,
  async (req, res, next) => {
    try {
      const budget = await budgetProvider.updateBudget(req.params.id, {
        ...req.body,
        updatedBy: req.user._id
      });
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }
);

// 审批预算
router.post('/:id/approve',
  auth,
  roles(['admin', 'finance_manager']),
  validateApproveBudget,
  async (req, res, next) => {
    try {
      const budget = await budgetProvider.approveBudget(req.params.id, {
        ...req.body,
        operator: req.user._id
      });
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }
);

// 获取预算统计
router.get('/stats/overview',
  auth,
  async (req, res, next) => {
    try {
      const stats = await budgetProvider.getBudgetStats(req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 