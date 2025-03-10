/**
 * 文档管理服务提供者
 */
const Document = require('../models/document.model');
const { ApiError } = require('../utils/apiError');
const { uploadFile, deleteFile } = require('../utils/fileUploader');
const { generatePDF } = require('../utils/pdfGenerator');

class DocumentProvider {
  /**
   * 创建文档
   */
  async createDocument(documentData, files) {
    // 处理文件上传
    const uploadedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await uploadFile(file, 'documents');
        uploadedFiles.push({
          filename: uploadResult.filename,
          originalname: file.originalname,
          path: uploadResult.path,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date()
        });
      }
    }

    const document = new Document({
      ...documentData,
      files: uploadedFiles
    });

    await document.save();
    return document;
  }

  /**
   * 获取文档列表
   */
  async getDocuments(query, userId) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      accessLevel,
      tags,
      keyword,
      startDate,
      endDate,
      sort = '-createdAt'
    } = query;

    // 构建查询条件
    const conditions = {};
    
    // 基础过滤
    if (project) conditions.project = project;
    if (type) conditions.type = type;
    if (status) conditions.status = status;
    if (accessLevel) conditions.accessLevel = accessLevel;
    if (tags) conditions.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    
    // 日期范围
    if (startDate || endDate) {
      conditions.createdAt = {};
      if (startDate) conditions.createdAt.$gte = new Date(startDate);
      if (endDate) conditions.createdAt.$lte = new Date(endDate);
    }

    // 关键词搜索
    if (keyword) {
      conditions.$or = [
        { title: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
        { tags: new RegExp(keyword, 'i') },
        { 'metadata.keywords': new RegExp(keyword, 'i') }
      ];
    }

    // 访问权限过滤
    const accessConditions = {
      $or: [
        { accessLevel: 'public' },
        { accessLevel: 'internal' },
        {
          accessLevel: { $in: ['confidential', 'restricted'] },
          'authorizedUsers.user': userId
        }
      ]
    };

    // 合并查询条件
    const finalConditions = { ...conditions, ...accessConditions };

    const [documents, total] = await Promise.all([
      Document.find(finalConditions)
        .populate('project', 'name code')
        .populate('createdBy', 'username')
        .populate('authorizedUsers.user', 'username')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Document.countDocuments(finalConditions)
    ]);

    return {
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取文档详情
   */
  async getDocument(id, userId) {
    const document = await Document.findById(id)
      .populate('project', 'name code')
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username')
      .populate('authorizedUsers.user', 'username')
      .populate('approvals.operator', 'username')
      .populate('versions.updatedBy', 'username');

    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    // 检查访问权限
    if (document.accessLevel === 'restricted' || 
        document.accessLevel === 'confidential') {
      throw new ApiError(403, '您没有权限访问此文档');
    }

    return document;
  }

  /**
   * 获取文档
   */
  async getDocumentById(documentId) {
    const document = await Document.findById(documentId)
      .populate('project', 'name code')
      .populate('references.document', 'code name')
      .populate('versions.createdBy', 'name')
      .populate('versions.updatedBy', 'name')
      .populate('versions.approval.approvedBy', 'name')
      .populate('access.users', 'name')
      .populate('approval.workflow.approver', 'name')
      .populate('approval.finalApproval.approvedBy', 'name')
      .populate('borrowings.user', 'name')
      .populate('readings.user', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    return document;
  }

  /**
   * 获取文档列表
   */
  async getDocumentsByQuery(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      category,
      status,
      confidentiality,
      keyword,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (confidentiality) filter['properties.confidentiality'] = confidentiality;
    if (keyword) filter['properties.keywords'] = keyword;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          sort = { name: 1 };
          break;
        case 'type':
          sort = { type: 1 };
          break;
        case 'category':
          sort = { category: 1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      documents
    };
  }

  /**
   * 更新文档
   */
  async updateDocument(documentId, updateData) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    Object.assign(document, updateData);
    await document.save();
    return document;
  }

  /**
   * 上传新版本
   */
  async uploadNewVersion(documentId, { file, version, description, changes, createdBy }) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    // 上传文件
    const result = await uploadFile(file, 'documents');

    // 创建新版本
    const newVersion = {
      version,
      url: result.Location,
      size: file.size,
      format: file.mimetype,
      description,
      changes,
      status: 'draft',
      createdBy
    };

    document.versions.push(newVersion);
    document.currentVersion = version;
    
    await document.save();
    return document;
  }

  /**
   * 审批版本
   */
  async approveVersion(documentId, version, { status, comments, approvedBy }) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    const versionDoc = document.versions.find(v => v.version === version);
    if (!versionDoc) {
      throw new ApiError(404, '版本不存在');
    }

    versionDoc.status = status;
    versionDoc.approval = {
      approvedBy,
      approvedAt: new Date(),
      comments
    };

    // 如果是当前版本，更新文档状态
    if (version === document.currentVersion) {
      if (status === 'approved') {
        document.status = 'active';
      } else if (status === 'rejected') {
        document.status = 'draft';
      }
    }

    await document.save();
    return document;
  }

  /**
   * 审批文档
   */
  async approveDocument(documentId, { step, status, comments, approvedBy }) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    // 更新审批工作流
    const workflowStep = document.approval.workflow.find(w => w.step === step);
    if (workflowStep) {
      workflowStep.approver = approvedBy;
      workflowStep.status = status;
      workflowStep.date = new Date();
      workflowStep.comments = comments;
    }

    // 如果是最终审批
    if (step === document.approval.workflow.length) {
      document.approval.finalApproval = {
        approvedBy,
        approvedAt: new Date(),
        comments
      };

      // 更新文档状态
      if (status === 'approved') {
        document.status = 'active';
      } else if (status === 'rejected') {
        document.status = 'draft';
      }
    }

    await document.save();
    return document;
  }

  /**
   * 借阅文档
   */
  async borrowDocument(documentId, { user, purpose, plannedReturnDate }) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    // 检查是否已借阅
    const existingBorrowing = document.borrowings.find(
      b => b.user.toString() === user.toString() && b.status === 'borrowed'
    );
    if (existingBorrowing) {
      throw new ApiError(400, '您已借阅此文档');
    }

    // 添加借阅记录
    document.borrowings.push({
      user,
      purpose,
      borrowedAt: new Date(),
      plannedReturnDate,
      status: 'borrowed'
    });

    await document.save();
    return document;
  }

  /**
   * 归还文档
   */
  async returnDocument(documentId, borrowingId) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    const borrowing = document.borrowings.id(borrowingId);
    if (!borrowing) {
      throw new ApiError(404, '借阅记录不存在');
    }

    borrowing.status = 'returned';
    borrowing.actualReturnDate = new Date();

    await document.save();
    return document;
  }

  /**
   * 记录阅读
   */
  async recordReading(documentId, { user, duration }) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    document.readings.push({
      user,
      readAt: new Date(),
      duration
    });

    await document.save();
    return document;
  }

  /**
   * 归档文档
   */
  async archiveDocument(documentId) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    document.status = 'archived';
    await document.save();
    return document;
  }

  /**
   * 废止文档
   */
  async obsoleteDocument(documentId) {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new ApiError(404, '文档不存在');
    }

    document.status = 'obsolete';
    await document.save();
    return document;
  }

  /**
   * 搜索文档
   */
  async searchDocuments(query = {}) {
    const {
      keyword,
      project,
      type,
      category,
      status,
      confidentiality,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = query;

    const filter = {};

    if (keyword) {
      filter.$or = [
        { name: new RegExp(keyword, 'i') },
        { code: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
        { 'properties.keywords': keyword }
      ];
    }

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (confidentiality) filter['properties.confidentiality'] = confidentiality;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .populate('project', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      documents
    };
  }

  /**
   * 获取文档统计
   */
  async getDocumentStats(query = {}) {
    const { project, startDate, endDate } = query;

    const filter = {};
    if (project) filter.project = project;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // 文档统计
    const documentStats = await Document.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // 借阅统计
    const borrowingStats = await Document.aggregate([
      {
        $match: {
          ...(project && { project: project }),
          'borrowings.borrowedAt': {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        }
      },
      { $unwind: '$borrowings' },
      {
        $group: {
          _id: '$borrowings.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 阅读统计
    const readingStats = await Document.aggregate([
      {
        $match: {
          ...(project && { project: project }),
          'readings.readAt': {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        }
      },
      { $unwind: '$readings' },
      {
        $group: {
          _id: null,
          totalReadings: { $sum: 1 },
          totalDuration: { $sum: '$readings.duration' }
        }
      }
    ]);

    return {
      documentStats,
      borrowingStats,
      readingStats: readingStats[0] || { totalReadings: 0, totalDuration: 0 }
    };
  }
}

module.exports = { DocumentProvider }; 