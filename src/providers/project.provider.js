/**
 * 项目管理服务提供者
 */
const { Project } = require('../models/project.model');
const { Milestone } = require('../models/milestone.model');
const { Risk } = require('../models/risk.model');
const { ResourceAllocation } = require('../models/resourceAllocation.model');
const { Cost } = require('../models/cost.model');
const { Document } = require('../models/document.model');
const { AppError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');
const { generatePDF } = require('../utils/pdfGenerator');

class ProjectProvider {
  /**
   * 创建项目
   */
  async createProject(projectData) {
    // 处理附件上传
    if (projectData.attachments) {
      for (let i = 0; i < projectData.attachments.length; i++) {
        const attachment = projectData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          projectData.attachments[i].url = result.Location;
          delete projectData.attachments[i].file;
        }
      }
    }

    const project = await Project.create(projectData);
    return project;
  }

  /**
   * 获取项目列表
   */
  async getProjects(query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      client,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (client) filter.client = client;
    if (startDate || endDate) {
      filter.plannedStartDate = {};
      if (startDate) filter.plannedStartDate.$gte = new Date(startDate);
      if (endDate) filter.plannedStartDate.$lte = new Date(endDate);
    }

    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'status':
          sort = { status: 1 };
          break;
        case 'startDate':
          sort = { plannedStartDate: 1 };
          break;
        case 'progress':
          sort = { progress: -1 };
          break;
      }
    }

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('client', 'name')
      .populate('manager', 'name')
      .populate('team.user', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      projects
    };
  }

  /**
   * 获取单个项目
   */
  async getProject(projectId) {
    const project = await Project.findById(projectId)
      .populate('client', 'name contact')
      .populate('manager', 'name phone email')
      .populate('team.user', 'name position phone email')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    return project;
  }

  /**
   * 更新项目
   */
  async updateProject(projectId, updateData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 处理新附件上传
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

    // 更新进度时自动更新状态
    if (updateData.progress !== undefined) {
      if (updateData.progress === 0) {
        updateData.status = 'pending';
      } else if (updateData.progress === 100) {
        updateData.status = 'completed';
      } else {
        updateData.status = 'in_progress';
      }
    }

    Object.assign(project, updateData);
    await project.save();
    return project;
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 检查项目是否可以删除
    if (project.status !== 'pending') {
      throw new AppError('只能删除未开始的项目', 400);
    }

    await project.remove();
    return { message: '项目已删除' };
  }

  /**
   * 更新项目团队
   */
  async updateProjectTeam(projectId, teamData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    project.team = teamData;
    await project.save();
    return project;
  }

  /**
   * 更新项目进度
   */
  async updateProjectProgress(projectId, { progress, progressNote }) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    project.progress = progress;
    project.progressNote = progressNote;

    // 根据进度自动更新状态
    if (progress === 0) {
      project.status = 'pending';
    } else if (progress === 100) {
      project.status = 'completed';
    } else {
      project.status = 'in_progress';
    }

    await project.save();
    return project;
  }

  /**
   * 获取项目统计数据
   */
  async getProjectStats() {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget.total' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const timeline = await Project.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$plannedStartDate' },
            month: { $month: '$plannedStartDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return { stats, timeline };
  }

  /**
   * 里程碑管理方法
   */
  async createMilestone(projectId, milestoneData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 检查里程碑日期是否在项目期限内
    const plannedDate = new Date(milestoneData.plannedDate);
    if (plannedDate < project.plannedStartDate || plannedDate > project.plannedEndDate) {
      throw new AppError('里程碑日期必须在项目期限内', 400);
    }

    const milestone = await Milestone.create({
      ...milestoneData,
      project: projectId
    });

    // 更新项目里程碑引用
    project.milestones.push(milestone._id);
    await project.save();

    return milestone;
  }

  async getMilestones(projectId) {
    const milestones = await Milestone.find({ project: projectId })
      .populate('responsiblePerson', 'name')
      .sort({ plannedDate: 1 });
    return milestones;
  }

  async updateMilestone(milestoneId, updateData) {
    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!milestone) {
      throw new AppError('里程碑不存在', 404);
    }
    return milestone;
  }

  /**
   * 风险管理方法
   */
  async createRisk(projectId, riskData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    const risk = await Risk.create({
      ...riskData,
      project: projectId,
      status: 'identified'
    });

    // 更新项目风险引用
    project.risks.push(risk._id);
    await project.save();

    return risk;
  }

  async getRisks(projectId, query = {}) {
    const { status, type, severity } = query;
    const filter = { project: projectId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const risks = await Risk.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    return risks;
  }

  async updateRisk(riskId, updateData) {
    const risk = await Risk.findByIdAndUpdate(
      riskId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!risk) {
      throw new AppError('风险不存在', 404);
    }
    return risk;
  }

  /**
   * 资源分配方法
   */
  async allocateResource(projectId, allocationData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 检查资源可用性
    await this.checkResourceAvailability(
      allocationData.resourceType,
      allocationData.resourceId,
      allocationData.startDate,
      allocationData.endDate,
      allocationData.quantity
    );

    const allocation = await ResourceAllocation.create({
      ...allocationData,
      project: projectId,
      status: 'allocated'
    });

    return allocation;
  }

  async getResourceAllocations(projectId, query = {}) {
    const { resourceType, startDate, endDate } = query;
    const filter = { project: projectId };

    if (resourceType) filter.resourceType = resourceType;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const allocations = await ResourceAllocation.find(filter)
      .populate('resourceId')
      .sort({ startDate: 1 });
    return allocations;
  }

  /**
   * 成本管理方法
   */
  async recordCost(projectId, costData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    const cost = await Cost.create({
      ...costData,
      project: projectId
    });

    // 更新项目总成本
    project.actualCost = (project.actualCost || 0) + costData.amount;
    await project.save();

    return cost;
  }

  async getCosts(projectId, query = {}) {
    const { type, startDate, endDate } = query;
    const filter = { project: projectId };

    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const costs = await Cost.find(filter).sort({ date: -1 });
    return costs;
  }

  /**
   * 文档管理方法
   */
  async uploadDocument(projectId, documentData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 上传文件到S3
    const result = await uploadToS3(documentData.file);

    const document = await Document.create({
      ...documentData,
      project: projectId,
      url: result.Location,
      status: 'active'
    });

    return document;
  }

  async getDocuments(projectId, query = {}) {
    const { category, status } = query;
    const filter = { project: projectId };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 });
    return documents;
  }

  /**
   * 报告生成方法
   */
  async generateReport(projectId, reportType) {
    const project = await this.getProject(projectId);
    let reportData = {};

    switch (reportType) {
      case 'progress':
        reportData = await this.generateProgressReport(project);
        break;
      case 'cost':
        reportData = await this.generateCostReport(project);
        break;
      case 'risk':
        reportData = await this.generateRiskReport(project);
        break;
      case 'resource':
        reportData = await this.generateResourceReport(project);
        break;
      default:
        throw new AppError('无效的报告类型', 400);
    }

    // 生成PDF报告
    const pdfBuffer = await generatePDF(reportData);

    // 上传PDF到S3
    const result = await uploadToS3({
      buffer: pdfBuffer,
      mimetype: 'application/pdf',
      originalname: `${project.code}_${reportType}_report.pdf`
    });

    // 创建文档记录
    const document = await Document.create({
      project: projectId,
      title: `${project.name} - ${reportType}报告`,
      category: 'report',
      url: result.Location,
      uploadedBy: project.manager
    });

    return {
      document,
      reportData
    };
  }

  /**
   * 辅助方法
   */
  async checkResourceAvailability(resourceType, resourceId, startDate, endDate, quantity) {
    // 检查资源在指定时间段的可用性
    const existingAllocations = await ResourceAllocation.find({
      resourceType,
      resourceId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    // 计算已分配数量
    const allocatedQuantity = existingAllocations.reduce(
      (total, allocation) => total + allocation.quantity,
      0
    );

    // 检查资源总量（需要从相应的资源模型中获取）
    const resource = await this.getResourceById(resourceType, resourceId);
    if (!resource) {
      throw new AppError('资源不存在', 404);
    }

    if (allocatedQuantity + quantity > resource.totalQuantity) {
      throw new AppError('资源数量不足', 400);
    }

    return true;
  }

  async generateProgressReport(project) {
    // 获取项目进度相关数据
    const milestones = await this.getMilestones(project._id);
    const tasks = await this.getProjectTasks(project._id);
    
    return {
      projectInfo: {
        name: project.name,
        code: project.code,
        progress: project.progress
      },
      milestones: milestones.map(m => ({
        name: m.name,
        plannedDate: m.plannedDate,
        actualDate: m.actualDate,
        status: m.status
      })),
      tasks: tasks.map(t => ({
        name: t.name,
        progress: t.progress,
        status: t.status
      }))
    };
  }

  // ... 其他报告生成方法 ...
}

module.exports = { ProjectProvider }; 