/**
 * 成本管理路由
 */
const express = require('express');
const router = express.Router();
const costProvider = require('../../providers/finance/cost.provider');
const { auth, roles } = require('../../middlewares/auth');
const {
  validateCreateCost,
  validateUpdateCost,
  validateQueryCosts
} = require('../../middlewares/validators/finance/cost.validator');

// 创建成本记录
router.post('/',
  auth,
  roles(['admin', 'finance_manager', 'project_manager']),
  validateCreateCost,
  async (req, res, next) => {
    try {
      const cost = await costProvider.createCost({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json(cost);
    } catch (error) {
      next(error);
    }
  }
);

// 获取成本列表
router.get('/',
  auth,
  validateQueryCosts,
  async (req, res, next) => {
    try {
      const costs = await costProvider.getCosts(req.query);
      res.json(costs);
    } catch (error) {
      next(error);
    }
  }
);

// 获取成本详情
router.get('/:id',
  auth,
  async (req, res, next) => {
    try {
      const cost = await costProvider.getCost(req.params.id);
      res.json(cost);
    } catch (error) {
      next(error);
    }
  }
);

// 更新成本记录
router.patch('/:id',
  auth,
  roles(['admin', 'finance_manager']),
  validateUpdateCost,
  async (req, res, next) => {
    try {
      const cost = await costProvider.updateCost(req.params.id, {
        ...req.body,
        updatedBy: req.user._id
      });
      res.json(cost);
    } catch (error) {
      next(error);
    }
  }
);

// 删除成本记录
router.delete('/:id',
  auth,
  roles(['admin', 'finance_manager']),
  async (req, res, next) => {
    try {
      await costProvider.deleteCost(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// 获取成本统计
router.get('/stats/overview',
  auth,
  async (req, res, next) => {
    try {
      const stats = await costProvider.getCostStats(req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// 获取成本趋势
router.get('/stats/trend',
  auth,
  async (req, res, next) => {
    try {
      const stats = await costProvider.getCostTrend(req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 