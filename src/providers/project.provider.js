/**
 * 项目管理服务提供者
 */
const { Project } = require('../models/project.model');
const { Milestone } = require('../models/milestone.model');
const { Risk } = require('../models/risk.model');
const { ResourceAllocation } = require('../models/resourceAllocation.model');
const { Cost } = require('../models/cost.model');
const { Document } = require('../models/document.model');
const { AppError, notFoundError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');
const { generatePDF } = require('../utils/pdfGenerator');

class ProjectProvider {
  /**
   * 创建项目
   */
  async createProject(projectData) {
    // 处理附件上传
    if (projectData.attachments) {
      const uploadedFiles = await Promise.all(
        projectData.attachments.map(async (attachment) => {
          const result = await uploadToS3(attachment.file, 'projects');
          return {
            name: attachment.name,
            file: {
              url: result.url,
              key: result.key
            },
            uploadedBy: projectData.createdBy,
            uploadedAt: new Date()
          };
        })
      );
      projectData.attachments = uploadedFiles;
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
      priority,
      startDate,
      endDate,
      search,
      sort = '-createdAt'
    } = query;

    // 构建查询条件
    const queryConditions = {};
    if (status) queryConditions.status = status;
    if (priority) queryConditions.priority = priority;
    if (startDate) queryConditions.startDate = { $gte: new Date(startDate) };
    if (endDate) queryConditions.plannedEndDate = { $lte: new Date(endDate) };
    if (search) {
      queryConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 执行查询
    const projects = await Project.find(queryConditions)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('team.user', 'name email');

    // 获取总数
    const total = await Project.countDocuments(queryConditions);

    return {
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  /**
   * 获取项目详情
   */
  async getProject(projectId) {
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('team.user', 'name email')
      .populate('milestones')
      .populate('risks')
      .populate('costs');

    if (!project) {
      throw notFoundError('项目不存在');
    }

    return project;
  }

  /**
   * 更新项目
   */
  async updateProject(projectId, updateData) {
    // 处理附件上传
    if (updateData.attachments) {
      const uploadedFiles = await Promise.all(
        updateData.attachments.map(async (attachment) => {
          const result = await uploadToS3(attachment.file, 'projects');
          return {
            name: attachment.name,
            file: {
              url: result.url,
              key: result.key
            },
            uploadedBy: updateData.updatedBy,
            uploadedAt: new Date()
          };
        })
      );
      updateData.attachments = uploadedFiles;
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      throw notFoundError('项目不存在');
    }

    return project;
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFoundError('项目不存在');
    }

    // 删除相关资源
    await Promise.all([
      Milestone.deleteMany({ project: projectId }),
      Risk.deleteMany({ project: projectId }),
      ResourceAllocation.deleteMany({ project: projectId }),
      Cost.deleteMany({ project: projectId }),
      Document.deleteMany({ project: projectId })
    ]);

    // 删除项目
    await project.deleteOne();

    return { message: '项目已成功删除' };
  }

  /**
   * 更新项目团队
   */
  async updateProjectTeam(projectId, teamData) {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $set: { team: teamData } },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw notFoundError('项目不存在');
    }

    return project;
  }

  /**
   * 更新项目进度
   */
  async updateProjectProgress(projectId, progressData) {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $set: { progress: progressData.progress } },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw notFoundError('项目不存在');
    }

    return project;
  }

  /**
   * 创建里程碑
   */
  async createMilestone(projectId, milestoneData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFoundError('项目不存在');
    }

    const milestone = await Milestone.create({
      ...milestoneData,
      project: projectId
    });

    return milestone;
  }

  /**
   * 获取里程碑列表
   */
  async getMilestones(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFoundError('项目不存在');
    }

    const milestones = await Milestone.find({ project: projectId })
      .populate('createdBy', 'name');

    return milestones;
  }

  /**
   * 创建风险
   */
  async createRisk(projectId, riskData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFoundError('项目不存在');
    }

    const risk = await Risk.create({
      ...riskData,
      project: projectId
    });

    return risk;
  }

  /**
   * 获取风险列表
   */
  async getRisks(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw notFoundError('项目不存在');
    }

    const risks = await Risk.find({ project: projectId })
      .populate('createdBy', 'name');

    return risks;
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