const express = require('express');
const router = express.Router();

// 引入财务管理相关路由
const budgetRoutes = require('./finance/budget.routes');
const costRoutes = require('./finance/cost.routes');
const paymentRoutes = require('./finance/payment.routes');
const invoiceRoutes = require('./finance/invoice.routes');

// 注册财务管理相关路由
router.use('/finance/budgets', budgetRoutes);
router.use('/finance/costs', costRoutes);
router.use('/finance/payments', paymentRoutes);
router.use('/finance/invoices', invoiceRoutes);

// 引入文档管理路由
const documentRoutes = require('./document.routes');

// 注册文档管理路由
router.use('/documents', documentRoutes);

module.exports = router; 