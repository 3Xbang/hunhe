/**
 * 设备管理路由
 */
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');
const equipmentProvider = require('../providers/equipment.provider');
const {
  validateCreateEquipment,
  validateUpdateEquipment,
  validateRecordUsage,
  validateRecordMaintenance,
  validateQueryEquipments
} = require('../middlewares/validators/equipment.validator');

/**
 * @route POST /api/v1/equipments
 * @desc 创建设备
 * @access Private
 */
router.post('/',
  auth,
  checkRole(['admin', 'manager']),
  uploadMiddleware.array('attachments'),
  validateCreateEquipment,
  async (req, res, next) => {
    try {
      const equipmentData = {
        ...req.body,
        createdBy: req.user._id,
        attachments: req.files
      };
      const equipment = await equipmentProvider.createEquipment(equipmentData);
      res.status(201).json({
        status: 'success',
        data: equipment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/equipments
 * @desc 获取设备列表
 * @access Private
 */
router.get('/',
  auth,
  validateQueryEquipments,
  async (req, res, next) => {
    try {
      const result = await equipmentProvider.getEquipments(req.query);
      res.status(200).json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/equipments/:id
 * @desc 获取设备详情
 * @access Private
 */
router.get('/:id',
  auth,
  async (req, res, next) => {
    try {
      const equipment = await equipmentProvider.getEquipment(req.params.id);
      res.status(200).json({
        status: 'success',
        data: equipment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/equipments/:id
 * @desc 更新设备信息
 * @access Private
 */
router.patch('/:id',
  auth,
  checkRole(['admin', 'manager']),
  uploadMiddleware.array('attachments'),
  validateUpdateEquipment,
  async (req, res, next) => {
    try {
      const updateData = {
        ...req.body,
        updatedBy: req.user._id,
        attachments: req.files
      };
      const equipment = await equipmentProvider.updateEquipment(req.params.id, updateData);
      res.status(200).json({
        status: 'success',
        data: equipment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/equipments/:id/usage
 * @desc 添加使用记录
 * @access Private
 */
router.post('/:id/usage',
  auth,
  validateRecordUsage,
  async (req, res, next) => {
    try {
      const usageData = {
        ...req.body,
        operator: req.user._id
      };
      const equipment = await equipmentProvider.recordEquipmentUsage(req.params.id, usageData);
      res.status(200).json({
        status: 'success',
        data: equipment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/equipments/:id/maintenance
 * @desc 添加维护记录
 * @access Private
 */
router.post('/:id/maintenance',
  auth,
  checkRole(['admin', 'manager', 'maintenance']),
  uploadMiddleware.array('attachments'),
  validateRecordMaintenance,
  async (req, res, next) => {
    try {
      const maintenanceData = {
        ...req.body,
        performer: req.user._id,
        attachments: req.files
      };
      const equipment = await equipmentProvider.recordMaintenance(req.params.id, maintenanceData);
      res.status(200).json({
        status: 'success',
        data: equipment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/equipments/stats/overview
 * @desc 获取设备统计信息
 * @access Private
 */
router.get('/stats/overview',
  auth,
  checkRole(['admin', 'manager']),
  async (req, res, next) => {
    try {
      const stats = await equipmentProvider.getEquipmentStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 