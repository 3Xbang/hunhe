/**
 * 发票管理路由
 */
const express = require('express');
const router = express.Router();
const invoiceProvider = require('../../providers/finance/invoice.provider');
const { auth, roles } = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');
const {
  validateCreateInvoice,
  validateVerifyInvoice,
  validateCancelInvoice,
  validateQueryInvoices
} = require('../../middlewares/validators/finance/invoice.validator');

// 登记发票
router.post('/',
  auth,
  roles(['admin', 'finance_manager']),
  upload.array('images', 5),
  validateCreateInvoice,
  async (req, res, next) => {
    try {
      const invoice = await invoiceProvider.createInvoice(
        {
          ...req.body,
          createdBy: req.user._id
        },
        req.files
      );
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }
);

// 获取发票列表
router.get('/',
  auth,
  validateQueryInvoices,
  async (req, res, next) => {
    try {
      const invoices = await invoiceProvider.getInvoices(req.query);
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  }
);

// 获取发票详情
router.get('/:id',
  auth,
  async (req, res, next) => {
    try {
      const invoice = await invoiceProvider.getInvoice(req.params.id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
);

// 验证发票
router.post('/:id/verify',
  auth,
  roles(['admin', 'finance_manager']),
  validateVerifyInvoice,
  async (req, res, next) => {
    try {
      const invoice = await invoiceProvider.verifyInvoice(req.params.id, {
        operator: req.user._id
      });
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
);

// 作废发票
router.post('/:id/cancel',
  auth,
  roles(['admin', 'finance_manager']),
  validateCancelInvoice,
  async (req, res, next) => {
    try {
      const invoice = await invoiceProvider.cancelInvoice(req.params.id, {
        ...req.body,
        operator: req.user._id
      });
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
);

// 获取发票统计
router.get('/stats/overview',
  auth,
  async (req, res, next) => {
    try {
      const stats = await invoiceProvider.getInvoiceStats(req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// 获取待验证发票
router.get('/pending/list',
  auth,
  roles(['admin', 'finance_manager']),
  async (req, res, next) => {
    try {
      const invoices = await invoiceProvider.getPendingInvoices(req.

module.exports = router; 