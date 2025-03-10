/**
 * 业务路由
 */
const express = require('express');
const businessController = require('../controllers/business.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateAttendance, validateTask, validatePurchase } = require('../middlewares/validators/business.validator');

const router = express.Router();

// 考勤管理
router.post('/attendance/check-in', 
  authenticate, 
  validateAttendance, 
  businessController.checkIn
);

router.post('/attendance/check-out', 
  authenticate, 
  validateAttendance, 
  businessController.checkOut
);

// 任务管理
router.post('/tasks', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateTask, 
  businessController.createTask
);

router.patch('/tasks/:taskId', 
  authenticate, 
  businessController.updateTask
);

// 客户看板
router.get('/client-dashboard', 
  authenticate, 
  authorize(['client']), 
  businessController.getClientDashboard
);

// 采购管理
router.post('/purchases', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validatePurchase, 
  businessController.createPurchaseOrder
);

router.patch('/purchases/:purchaseId/status', 
  authenticate, 
  authorize(['admin', 'manager']), 
  businessController.updatePurchaseStatus
);

module.exports = router; 