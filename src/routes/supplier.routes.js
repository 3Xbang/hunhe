/**
 * 供应商管理路由
 */
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');
const supplierProvider = require('../providers/supplier.provider');
const {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateAddEvaluation,
  validateRecordTransaction,
  validateUpdateCooperationStatus,
  validateUpdateBlacklist,
  validateQuerySuppliers,
  validateAddQualification
} = require('../middlewares/validators/supplier.validator');

/**
 * @api {post} /api/v1/suppliers 创建供应商
 * @apiName CreateSupplier
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.post('/',
  auth,
  checkRole(['admin', 'manager']),
  uploadMiddleware.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxInfo', maxCount: 1 },
    { name: 'bankInfo', maxCount: 1 },
    { name: 'qualifications', maxCount: 5 },
    { name: 'attachments', maxCount: 10 }
  ]),
  validateCreateSupplier,
  async (req, res, next) => {
    try {
      const supplierData = {
        ...req.body,
        createdBy: req.user._id,
        attachments: req.files?.attachments,
        businessLicense: {
          ...req.body.businessLicense,
          attachment: req.files?.businessLicense?.[0]
        },
        taxInfo: {
          ...req.body.taxInfo,
          attachment: req.files?.taxInfo?.[0]
        },
        bankInfo: {
          ...req.body.bankInfo,
          attachment: req.files?.bankInfo?.[0]
        }
      };

      // 处理资质证书附件
      if (req.files?.qualifications) {
        supplierData.qualifications = JSON.parse(req.body.qualifications).map((qual, index) => ({
          ...qual,
          attachment: req.files.qualifications[index]
        }));
      }

      const supplier = await supplierProvider.createSupplier(supplierData);
      res.status(201).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {get} /api/v1/suppliers 获取供应商列表
 * @apiName GetSuppliers
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.get('/',
  auth,
  validateQuerySuppliers,
  async (req, res, next) => {
    try {
      const result = await supplierProvider.getSuppliers(req.query);
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
 * @api {get} /api/v1/suppliers/:id 获取供应商详情
 * @apiName GetSupplier
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.get('/:id',
  auth,
  async (req, res, next) => {
    try {
      const supplier = await supplierProvider.getSupplier(req.params.id);
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {patch} /api/v1/suppliers/:id 更新供应商信息
 * @apiName UpdateSupplier
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.patch('/:id',
  auth,
  checkRole(['admin', 'manager']),
  uploadMiddleware.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxInfo', maxCount: 1 },
    { name: 'bankInfo', maxCount: 1 },
    { name: 'qualifications', maxCount: 5 },
    { name: 'attachments', maxCount: 10 }
  ]),
  validateUpdateSupplier,
  async (req, res, next) => {
    try {
      const updateData = {
        ...req.body,
        updatedBy: req.user._id
      };

      // 处理附件
      if (req.files) {
        if (req.files.businessLicense) {
          updateData.businessLicense = {
            ...updateData.businessLicense,
            attachment: req.files.businessLicense[0]
          };
        }
        if (req.files.taxInfo) {
          updateData.taxInfo = {
            ...updateData.taxInfo,
            attachment: req.files.taxInfo[0]
          };
        }
        if (req.files.bankInfo) {
          updateData.bankInfo = {
            ...updateData.bankInfo,
            attachment: req.files.bankInfo[0]
          };
        }
        if (req.files.attachments) {
          updateData.attachments = req.files.attachments;
        }
      }

      const supplier = await supplierProvider.updateSupplier(req.params.id, updateData);
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {post} /api/v1/suppliers/:id/evaluations 添加供应商评价
 * @apiName AddSupplierEvaluation
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.post('/:id/evaluations',
  auth,
  checkRole(['admin', 'manager', 'project_manager']),
  validateAddEvaluation,
  async (req, res, next) => {
    try {
      const evaluationData = {
        ...req.body,
        evaluator: req.user._id
      };
      
      const supplier = await supplierProvider.addEvaluation(req.params.id, evaluationData);
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {post} /api/v1/suppliers/:id/transactions 记录交易
 * @apiName RecordTransaction
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.post('/:id/transactions',
  auth,
  checkRole(['admin', 'manager', 'finance']),
  validateRecordTransaction,
  async (req, res, next) => {
    try {
      const transactionData = {
        ...req.body,
        operator: req.user._id
      };
      
      const supplier = await supplierProvider.recordTransaction(req.params.id, transactionData);
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {patch} /api/v1/suppliers/:id/cooperation 更新合作状态
 * @apiName UpdateCooperationStatus
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.patch('/:id/cooperation',
  auth,
  checkRole(['admin', 'manager']),
  validateUpdateCooperationStatus,
  async (req, res, next) => {
    try {
      const supplier = await supplierProvider.updateCooperationStatus(req.params.id, {
        status: req.body.status,
        updatedBy: req.user._id
      });
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {patch} /api/v1/suppliers/:id/blacklist 更新黑名单状态
 * @apiName UpdateBlacklist
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.patch('/:id/blacklist',
  auth,
  checkRole(['admin']),
  validateUpdateBlacklist,
  async (req, res, next) => {
    try {
      const supplier = await supplierProvider.updateBlacklist(req.params.id, {
        isBlacklisted: req.body.isBlacklisted,
        reason: req.body.reason,
        operator: req.user._id
      });
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {post} /api/v1/suppliers/:id/qualifications 添加资质证书
 * @apiName AddQualification
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.post('/:id/qualifications',
  auth,
  checkRole(['admin', 'manager']),
  uploadMiddleware.single('attachment'),
  validateAddQualification,
  async (req, res, next) => {
    try {
      const qualificationData = {
        ...req.body,
        attachment: req.file
      };
      
      const supplier = await supplierProvider.addQualification(req.params.id, qualificationData);
      res.status(200).json({
        status: 'success',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {get} /api/v1/suppliers/stats/overview 获取供应商统计信息
 * @apiName GetSupplierStats
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.get('/stats/overview',
  auth,
  checkRole(['admin', 'manager']),
  async (req, res, next) => {
    try {
      const stats = await supplierProvider.getSupplierStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {get} /api/v1/suppliers/stats/expired-docs 获取过期文档的供应商
 * @apiName GetExpiredDocSuppliers
 * @apiGroup Supplier
 * @apiVersion 1.0.0
 */
router.get('/stats/expired-docs',
  auth,
  checkRole(['admin', 'manager']),
  async (req, res, next) => {
    try {
      const suppliers = await supplierProvider.getExpiredDocSuppliers();
      res.status(200).json({
        status: 'success',
        data: suppliers
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 