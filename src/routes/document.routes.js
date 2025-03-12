/**
 * 文档管理路由
 */
const express = require('express');
const router = express.Router();
const documentProvider = require('../providers/document.provider');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  validateCreateDocument,
  validateUpdateDocument,
  validateUpdateDocumentStatus,
  validateUpdateDocumentPermissions,
  validateQueryDocuments,
  validateAddDocumentVersion,
  validateDocumentStats,
  validateSearchDocuments
} = require('../middlewares/validators/document.validator');

// 创建文档
router.post('/',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  upload.array('files', 10), // 最多允许上传10个文件
  validateCreateDocument,
  async (req, res, next) => {
    try {
      const document = await documentProvider.createDocument(
        {
          ...req.body,
          createdBy: req.user._id
        },
        req.files
      );
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 获取文档列表
router.get('/',
  authenticate,
  validateQueryDocuments,
  async (req, res, next) => {
    try {
      const documents = await documentProvider.getDocuments(req.query, req.user._id);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  }
);

// 获取文档详情
router.get('/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const document = await documentProvider.getDocument(req.params.id, req.user._id);
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 更新文档
router.patch('/:id',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  upload.array('files', 10),
  validateUpdateDocument,
  async (req, res, next) => {
    try {
      const document = await documentProvider.updateDocument(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user._id
        },
        req.files,
        req.user._id
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 删除文档
router.delete('/:id',
  authenticate,
  authorize('admin', 'project_manager'),
  async (req, res, next) => {
    try {
      await documentProvider.deleteDocument(req.params.id, req.user._id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// 更新文档状态
router.post('/:id/status',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  validateUpdateDocumentStatus,
  async (req, res, next) => {
    try {
      const document = await documentProvider.updateDocumentStatus(
        req.params.id,
        {
          ...req.body,
          operator: req.user._id
        }
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 更新文档权限
router.post('/:id/permissions',
  authenticate,
  authorize('admin', 'project_manager'),
  validateUpdateDocumentPermissions,
  async (req, res, next) => {
    try {
      const document = await documentProvider.updateDocumentPermissions(
        req.params.id,
        req.body,
        req.user._id
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 添加文档版本
router.post('/:id/versions',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  upload.array('files', 10),
  validateAddDocumentVersion,
  async (req, res, next) => {
    try {
      const document = await documentProvider.uploadNewVersion(
        req.params.id,
        {
          ...req.body,
          files: req.files,
          createdBy: req.user._id
        }
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 审批文档版本
router.post('/:id/versions/:version/approve',
  authenticate,
  authorize('admin', 'project_manager'),
  async (req, res, next) => {
    try {
      const document = await documentProvider.approveVersion(
        req.params.id,
        req.params.version,
        {
          ...req.body,
          approvedBy: req.user._id
        }
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 借阅文档
router.post('/:id/borrow',
  authenticate,
  async (req, res, next) => {
    try {
      const document = await documentProvider.borrowDocument(
        req.params.id,
        {
          ...req.body,
          user: req.user._id
        }
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 归还文档
router.post('/:id/return/:borrowingId',
  authenticate,
  async (req, res, next) => {
    try {
      const document = await documentProvider.returnDocument(
        req.params.id,
        req.params.borrowingId
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 记录文档阅读
router.post('/:id/read',
  authenticate,
  async (req, res, next) => {
    try {
      const document = await documentProvider.recordReading(
        req.params.id,
        {
          user: req.user._id,
          duration: req.body.duration
        }
      );
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 归档文档
router.post('/:id/archive',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  async (req, res, next) => {
    try {
      const document = await documentProvider.archiveDocument(req.params.id);
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 废止文档
router.post('/:id/obsolete',
  authenticate,
  authorize('admin', 'project_manager'),
  async (req, res, next) => {
    try {
      const document = await documentProvider.obsoleteDocument(req.params.id);
      res.json(document);
    } catch (error) {
      next(error);
    }
  }
);

// 搜索文档
router.get('/search',
  authenticate,
  validateSearchDocuments,
  async (req, res, next) => {
    try {
      const results = await documentProvider.searchDocuments(req.query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
);

// 获取文档统计
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  validateDocumentStats,
  async (req, res, next) => {
    try {
      const stats = await documentProvider.getDocumentStats(req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// 生成文档报告
router.get('/:id/report',
  authenticate,
  authorize('admin', 'project_manager', 'document_manager'),
  async (req, res, next) => {
    try {
      const report = await documentProvider.generateDocumentReport(
        req.params.id,
        req.user._id
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 