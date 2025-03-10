/**
 * 设备路由
 */
const express = require('express');
const deviceController = require('../controllers/device.controller');
const { authenticate } = require('../middlewares/auth');
const { validateDeviceOperation } = require('../middlewares/validators/device.validator');

const router = express.Router();

// 设备借出和归还
router.post('/:deviceId/borrow', authenticate, validateDeviceOperation, deviceController.borrowDevice);
router.post('/:deviceId/return', authenticate, validateDeviceOperation, deviceController.returnDevice);

// 设备维护
router.post('/:deviceId/maintenance', authenticate, deviceController.addMaintenanceRecord);

// 设备查询
router.get('/', authenticate, deviceController.getAllDevices);
router.get('/:deviceId', authenticate, deviceController.getDeviceById);

module.exports = router; 