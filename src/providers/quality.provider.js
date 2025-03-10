/**
 * 质量管理服务提供者
 */
const { Standard, Inspection, Issue, Improvement } = require('../models/quality.model');
const { AppError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');

class QualityProvider {
  /**
   * 创建质量标准
   */
  async createStandard(standardData) {
    // 上传附件
    if (standardData.attachments) {
      for (let i = 0; i < standardData.attachments.length; i++) {
        const attachment = standardData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          standardData.attachments[i].url = result.Location;
          delete standardData.attachments[i].file;
        }
      }
    }

    const standard = await Standard.create(standardData);
    return standard;
  }

  /**
   * 获取质量标准
   */
  async getStandard(standardId) {
    const standard = await Standard.findById(standardId)
      .populate('applicableProjects', 'name code')
      .populate('applicableMaterials', 'name code')
      .populate('attachments.uploadedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!standard) {
      throw new AppError('质量标准不存在', 404);
    }

    return standard;
  }

  /**
   * 获取质量标准列表
   */
  async getStandards(query = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      project,
      material,
      sortBy
    } = query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (project) filter.applicableProjects = project;
    if (material) filter.applicableMaterials = material;

    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          sort = { name: 1 };
          break;
        case 'code':
          sort = { code: 1 };
          break;
        case 'effectiveDate':
          sort = { effectiveDate: -1 };
          break;
      }
    }

    const total = await Standard.countDocuments(filter);
    const standards = await Standard.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      standards
    };
  }

  /**
   * 更新质量标准
   */
  async updateStandard(standardId, updateData) {
    const standard = await Standard.findById(standardId);
    if (!standard) {
      throw new AppError('质量标准不存在', 404);
    }

    // 上传新附件
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    Object.assign(standard, updateData);
    await standard.save();
    return standard;
  }

  /**
   * 审批质量标准
   */
  async approveStandard(standardId, { status, notes, approvedBy }) {
    const standard = await Standard.findById(standardId);
    if (!standard) {
      throw new AppError('质量标准不存在', 404);
    }

    standard.status = status;
    standard.approvalNotes = notes;
    standard.approvedBy = approvedBy;
    standard.approvalDate = new Date();

    await standard.save();
    return standard;
  }

  /**
   * 创建质量检查
   */
  async createInspection(inspectionData) {
    // 上传附件
    if (inspectionData.attachments) {
      for (let i = 0; i < inspectionData.attachments.length; i++) {
        const attachment = inspectionData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          inspectionData.attachments[i].url = result.Location;
          delete inspectionData.attachments[i].file;
        }
      }
    }

    const inspection = await Inspection.create(inspectionData);
    return inspection;
  }

  /**
   * 获取质量检查
   */
  async getInspection(inspectionId) {
    const inspection = await Inspection.findById(inspectionId)
      .populate('project', 'name code')
      .populate('standards.standard')
      .populate('materials.material', 'name code')
      .populate('equipment.equipment', 'name code')
      .populate('improvements.assignedTo', 'name')
      .populate('improvements.verifiedBy', 'name')
      .populate('inspector', 'name')
      .populate('participants', 'name')
      .populate('reviewedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!inspection) {
      throw new AppError('质量检查不存在', 404);
    }

    return inspection;
  }

  /**
   * 获取质量检查列表
   */
  async getInspections(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      inspector,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (inspector) filter.inspector = inspector;
    if (startDate || endDate) {
      filter.plannedDate = {};
      if (startDate) filter.plannedDate.$gte = new Date(startDate);
      if (endDate) filter.plannedDate.$lte = new Date(endDate);
    }

    let sort = { plannedDate: 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'result':
          sort = { result: 1 };
          break;
        case 'score':
          sort = { score: -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await Inspection.countDocuments(filter);
    const inspections = await Inspection.find(filter)
      .populate('project', 'name code')
      .populate('inspector', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      inspections
    };
  }

  /**
   * 更新质量检查
   */
  async updateInspection(inspectionId, updateData) {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      throw new AppError('质量检查不存在', 404);
    }

    // 上传新附件
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    Object.assign(inspection, updateData);
    await inspection.save();
    return inspection;
  }

  /**
   * 审核质量检查
   */
  async reviewInspection(inspectionId, { reviewNotes, reviewedBy }) {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      throw new AppError('质量检查不存在', 404);
    }

    inspection.reviewNotes = reviewNotes;
    inspection.reviewedBy = reviewedBy;
    inspection.reviewedAt = new Date();
    inspection.status = 'completed';

    await inspection.save();
    return inspection;
  }

  /**
   * 创建质量问题
   */
  async createIssue(issueData) {
    // 上传附件
    if (issueData.attachments) {
      for (let i = 0; i < issueData.attachments.length; i++) {
        const attachment = issueData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          issueData.attachments[i].url = result.Location;
          delete issueData.attachments[i].file;
        }
      }
    }

    const issue = await Issue.create(issueData);
    return issue;
  }

  /**
   * 获取质量问题
   */
  async getIssue(issueId) {
    const issue = await Issue.findById(issueId)
      .populate('project', 'name code')
      .populate('relatedInspection')
      .populate('relatedMaterials', 'name code')
      .populate('relatedEquipment', 'name code')
      .populate('assignedTo', 'name')
      .populate('verifiedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!issue) {
      throw new AppError('质量问题不存在', 404);
    }

    return issue;
  }

  /**
   * 获取质量问题列表
   */
  async getIssues(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      severity,
      status,
      assignedTo,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'severity':
          sort = { severity: -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
        case 'deadline':
          sort = { deadline: 1 };
          break;
      }
    }

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('project', 'name code')
      .populate('assignedTo', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      issues
    };
  }

  /**
   * 更新质量问题
   */
  async updateIssue(issueId, updateData) {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new AppError('质量问题不存在', 404);
    }

    // 上传新附件
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    Object.assign(issue, updateData);

    // 更新状态相关字段
    if (updateData.status === 'resolved' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    } else if (updateData.status === 'closed' && !issue.closedAt) {
      issue.closedAt = new Date();
    }

    await issue.save();
    return issue;
  }

  /**
   * 验证质量问题
   */
  async verifyIssue(issueId, { result, notes, verifiedBy }) {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new AppError('质量问题不存在', 404);
    }

    issue.verificationResult = result;
    issue.verificationNotes = notes;
    issue.verifiedBy = verifiedBy;
    issue.verifiedAt = new Date();

    if (result === 'accepted') {
      issue.status = 'closed';
      issue.closedAt = new Date();
    } else {
      issue.status = 'reopened';
    }

    await issue.save();
    return issue;
  }

  /**
   * 创建改进措施
   */
  async createImprovement(improvementData) {
    // 上传附件
    if (improvementData.attachments) {
      for (let i = 0; i < improvementData.attachments.length; i++) {
        const attachment = improvementData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          improvementData.attachments[i].url = result.Location;
          delete improvementData.attachments[i].file;
        }
      }
    }

    const improvement = await Improvement.create(improvementData);
    return improvement;
  }

  /**
   * 获取改进措施
   */
  async getImprovement(improvementId) {
    const improvement = await Improvement.findById(improvementId)
      .populate('project', 'name code')
      .populate('relatedIssues')
      .populate('relatedInspections')
      .populate('resources.equipment', 'name code')
      .populate('resources.materials', 'name code')
      .populate('actions.assignedTo', 'name')
      .populate('responsiblePerson', 'name')
      .populate('team', 'name')
      .populate('evaluation.evaluatedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!improvement) {
      throw new AppError('改进措施不存在', 404);
    }

    return improvement;
  }

  /**
   * 获取改进措施列表
   */
  async getImprovements(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      responsiblePerson,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (responsiblePerson) filter.responsiblePerson = responsiblePerson;
    if (startDate || endDate) {
      filter.plannedStartDate = {};
      if (startDate) filter.plannedStartDate.$gte = new Date(startDate);
      if (endDate) filter.plannedStartDate.$lte = new Date(endDate);
    }

    let sort = { plannedStartDate: 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'status':
          sort = { status: 1 };
          break;
        case 'type':
          sort = { type: 1 };
          break;
      }
    }

    const total = await Improvement.countDocuments(filter);
    const improvements = await Improvement.find(filter)
      .populate('project', 'name code')
      .populate('responsiblePerson', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      improvements
    };
  }

  /**
   * 更新改进措施
   */
  async updateImprovement(improvementId, updateData) {
    const improvement = await Improvement.findById(improvementId);
    if (!improvement) {
      throw new AppError('改进措施不存在', 404);
    }

    // 上传新附件
    if (updateData.attachments) {
      for (let i = 0; i < updateData.attachments.length; i++) {
        const attachment = updateData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.attachments[i].url = result.Location;
          delete updateData.attachments[i].file;
        }
      }
    }

    Object.assign(improvement, updateData);

    // 更新时间相关字段
    if (updateData.status === 'in_progress' && !improvement.actualStartDate) {
      improvement.actualStartDate = new Date();
    } else if (updateData.status === 'completed' && !improvement.actualEndDate) {
      improvement.actualEndDate = new Date();
    }

    await improvement.save();
    return improvement;
  }

  /**
   * 评估改进措施
   */
  async evaluateImprovement(improvementId, evaluationData) {
    const improvement = await Improvement.findById(improvementId);
    if (!improvement) {
      throw new AppError('改进措施不存在', 404);
    }

    improvement.evaluation = {
      ...evaluationData,
      evaluatedAt: new Date()
    };

    await improvement.save();
    return improvement;
  }

  /**
   * 获取项目质量统计
   */
  async getProjectQualityStats(projectId) {
    // 检查统计
    const inspectionStats = await Inspection.aggregate([
      {
        $match: { project: projectId }
      },
      {
        $group: {
          _id: {
            type: '$type',
            result: '$result'
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    // 问题统计
    const issueStats = await Issue.aggregate([
      {
        $match: { project: projectId }
      },
      {
        $group: {
          _id: {
            type: '$type',
            severity: '$severity',
            status: '$status'
          },
          count: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $and: [
                  { $eq: ['$status', 'resolved'] },
                  { $ne: ['$resolvedAt', null] }
                ]},
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    // 改进措施统计
    const improvementStats = await Improvement.aggregate([
      {
        $match: { project: projectId }
      },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalBudget: { $sum: '$resources.budget' },
          totalActualCost: { $sum: '$resources.actualCost' }
        }
      }
    ]);

    return {
      inspectionStats,
      issueStats,
      improvementStats
    };
  }
}

module.exports = { QualityProvider }; 