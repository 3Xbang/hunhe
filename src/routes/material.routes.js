/**
 * 材料管理路由
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');
const materialProvider = require('../providers/material.provider');
const {
  validateCreateMaterial,
  validateUpdateMaterial,
  validateInbound,
  validateOutbound,
  validateQueryMaterials
} = require('../middlewares/validators/material.validator');

/**
 * @route POST /api/v1/materials
 * @desc 创建材料
 * @access Private
 */
router.post('/',
  authenticate,
  authorize(['admin', 'manager']),
  uploadMiddleware.array('attachments'),
  validateCreateMaterial,
  async (req, res, next) => {
    try {
      const materialData = {
        ...req.body,
        createdBy: req.user._id,
        attachments: req.files
      };
      const material = await materialProvider.createMaterial(materialData);
      res.status(201).json({
        status: 'success',
        data: material
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/materials
 * @desc 获取材料列表
 * @access Private
 */
router.get('/',
  authenticate,
  validateQueryMaterials,
  async (req, res, next) => {
    try {
      const result = await materialProvider.getMaterials(req.query);
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
 * @route GET /api/v1/materials/:id
 * @desc 获取材料详情
 * @access Private
 */
router.get('/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const material = await materialProvider.getMaterial(req.params.id);
      res.status(200).json({
        status: 'success',
        data: material
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/v1/materials/:id
 * @desc 更新材料信息
 * @access Private
 */
router.patch('/:id',
  authenticate,
  authorize(['admin', 'manager']),
  uploadMiddleware.array('attachments'),
  validateUpdateMaterial,
  async (req, res, next) => {
    try {
      const updateData = {
        ...req.body,
        updatedBy: req.user._id,
        attachments: req.files
      };
      const material = await materialProvider.updateMaterial(req.params.id, updateData);
      res.status(200).json({
        status: 'success',
        data: material
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/materials/:id/inbound
 * @desc 材料入库
 * @access Private
 */
router.post('/:id/inbound',
  authenticate,
  authorize(['admin', 'manager', 'warehouse']),
  uploadMiddleware.array('attachments'),
  validateInbound,
  async (req, res, next) => {
    try {
      const inboundData = {
        ...req.body,
        operator: req.user._id,
        attachments: req.files,
        date: new Date()
      };
      const material = await materialProvider.inboundMaterial(req.params.id, inboundData);
      res.status(200).json({
        status: 'success',
        data: material
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/materials/:id/outbound
 * @desc 材料出库
 * @access Private
 */
router.post('/:id/outbound',
  authenticate,
  authorize(['admin', 'manager', 'warehouse']),
  validateOutbound,
  async (req, res, next) => {
    try {
      const outboundData = {
        ...req.body,
        operator: req.user._id,
        date: new Date()
      };
      const material = await materialProvider.outboundMaterial(req.params.id, outboundData);
      res.status(200).json({
        status: 'success',
        data: material
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/materials/stats/low-stock
 * @desc 获取库存预警列表
 * @access Private
 */
router.get('/stats/low-stock',
  authenticate,
  authorize(['admin', 'manager', 'warehouse']),
  async (req, res, next) => {
    try {
      const materials = await materialProvider.getLowStockMaterials();
      res.status(200).json({
        status: 'success',
        data: materials
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/materials/stats/overview
 * @desc 获取材料统计信息
 * @access Private
 */
router.get('/stats/overview',
  authenticate,
  authorize(['admin', 'manager']),
  async (req, res, next) => {
    try {
      const stats = await materialProvider.getMaterialStats();
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