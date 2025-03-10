/**
 * 付款管理路由
 */
const express = require('express');
const router = express.Router();
const paymentProvider = require('../../providers/finance/payment.provider');
const { auth, roles } = require('../../middlewares/auth');
const {
  validateCreatePayment,
  validateApprovePayment,
  validateConfirmPayment,
  validateQueryPayments
} = require('../../middlewares/validators/finance/payment.validator');

// 创建付款申请
router.post('/',
  auth,
  roles(['admin', 'finance_manager', 'project_manager']),
  validateCreatePayment,
  async (req, res, next) => {
    try {
      const payment = await paymentProvider.createPayment({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// 获取付款列表
router.get('/',
  auth,
  validateQueryPayments,
  async (req, res, next) => {
    try {
      const payments = await paymentProvider.getPayments(req.query);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
);

// 获取付款详情
router.get('/:id',
  auth,
  async (req, res, next) => {
    try {
      const payment = await paymentProvider.getPayment(req.params.id);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// 审批付款
router.post('/:id/approve',
  auth,
  roles(['admin', 'finance_manager']),
  validateApprovePayment,
  async (req, res, next) => {
    try {
      const payment = await paymentProvider.approvePayment(req.params.id, {
        ...req.body,
        operator: req.user._id
      });
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// 确认付款
router.post('/:id/confirm',
  auth,
  roles(['admin', 'finance_manager']),
  validateConfirmPayment,
  async (req, res, next) => {
    try {
      const payment = await paymentProvider.confirmPayment(req.params.id, {
        ...req.body,
        operator: req.user._id
      });
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// 获取付款统计
router.get('/stats/overview',
  auth,
  async (req, res, next) => {
    try {
      const stats = await paymentProvider.getPaymentStats(req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// 获取付款计划
router.get('/stats/plan',
  auth,
  async (req, res, next) => {
    try {
      const plan = await paymentProvider.getPaymentPlan(req.query);
      res.json(plan);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 