/**
 * 进度管理服务提供者
 */
const { Milestone, Task } = require('../models/progress.model');
const { AppError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');

class ProgressProvider {
  /**
   * 创建里程碑
   */
  async createMilestone(milestoneData) {
    // 上传附件
    if (milestoneData.attachments) {
      for (let i = 0; i < milestoneData.attachments.length; i++) {
        const attachment = milestoneData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          milestoneData.attachments[i].url = result.Location;
          delete milestoneData.attachments[i].file;
        }
      }
    }

    const milestone = await Milestone.create(milestoneData);
    return milestone;
  }

  /**
   * 获取里程碑
   */
  async getMilestone(milestoneId) {
    const milestone = await Milestone.findById(milestoneId)
      .populate('project', 'name code')
      .populate('dependencies.milestone', 'name')
      .populate('responsiblePerson', 'name')
      .populate('participants', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!milestone) {
      throw new AppError('里程碑不存在', 404);
    }

    return milestone;
  }

  /**
   * 获取里程碑列表
   */
  async getMilestones(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      status,
      responsiblePerson,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
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
        case 'progress':
          sort = { progress: -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await Milestone.countDocuments(filter);
    const milestones = await Milestone.find(filter)
      .populate('project', 'name code')
      .populate('responsiblePerson', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      milestones
    };
  }

  /**
   * 更新里程碑
   */
  async updateMilestone(milestoneId, updateData) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      throw new AppError('里程碑不存在', 404);
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

    Object.assign(milestone, updateData);
    await milestone.save();
    return milestone;
  }

  /**
   * 更新里程碑进度
   */
  async updateMilestoneProgress(milestoneId, progress) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      throw new AppError('里程碑不存在', 404);
    }

    milestone.progress = progress;

    if (progress === 100) {
      milestone.status = 'completed';
      milestone.actualEndDate = new Date();
    } else if (progress > 0) {
      milestone.status = 'in_progress';
      if (!milestone.actualStartDate) {
        milestone.actualStartDate = new Date();
      }
    }

    await milestone.save();
    return milestone;
  }

  /**
   * 创建任务
   */
  async createTask(taskData) {
    // 上传附件
    if (taskData.attachments) {
      for (let i = 0; i < taskData.attachments.length; i++) {
        const attachment = taskData.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          taskData.attachments[i].url = result.Location;
          delete taskData.attachments[i].file;
        }
      }
    }

    const task = await Task.create(taskData);
    return task;
  }

  /**
   * 获取任务
   */
  async getTask(taskId) {
    const task = await Task.findById(taskId)
      .populate('project', 'name code')
      .populate('milestone', 'name')
      .populate('dependencies.task', 'name')
      .populate('assignedTo', 'name')
      .populate('reviewedBy', 'name')
      .populate('participants', 'name')
      .populate('materials.material', 'name code')
      .populate('equipment.equipment', 'name code')
      .populate('issues.reportedBy', 'name')
      .populate('issues.resolvedBy', 'name')
      .populate('attachments.uploadedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!task) {
      throw new AppError('任务不存在', 404);
    }

    return task;
  }

  /**
   * 获取任务列表
   */
  async getTasks(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      milestone,
      status,
      priority,
      assignedTo,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (milestone) filter.milestone = milestone;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
      filter.plannedStartDate = {};
      if (startDate) filter.plannedStartDate.$gte = new Date(startDate);
      if (endDate) filter.plannedStartDate.$lte = new Date(endDate);
    }

    let sort = { plannedStartDate: 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'priority':
          sort = { priority: -1 };
          break;
        case 'progress':
          sort = { progress: -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('project', 'name code')
      .populate('milestone', 'name')
      .populate('assignedTo', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      tasks
    };
  }

  /**
   * 更新任务
   */
  async updateTask(taskId, updateData) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('任务不存在', 404);
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

    Object.assign(task, updateData);
    await task.save();

    // 更新里程碑进度
    const milestone = await Milestone.findById(task.milestone);
    if (milestone) {
      await milestone.updateProgress();
    }

    return task;
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(taskId, progress) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('任务不存在', 404);
    }

    task.progress = progress;

    if (progress === 100) {
      task.status = 'completed';
      task.actualEndDate = new Date();
    } else if (progress > 0) {
      task.status = 'in_progress';
      if (!task.actualStartDate) {
        task.actualStartDate = new Date();
      }
    }

    await task.save();

    // 更新里程碑进度
    const milestone = await Milestone.findById(task.milestone);
    if (milestone) {
      await milestone.updateProgress();
    }

    return task;
  }

  /**
   * 添加任务问题
   */
  async addTaskIssue(taskId, issueData) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('任务不存在', 404);
    }

    return await task.addIssue(issueData);
  }

  /**
   * 解决任务问题
   */
  async resolveTaskIssue(taskId, issueId, resolution) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('任务不存在', 404);
    }

    return await task.resolveIssue(issueId, resolution);
  }

  /**
   * 获取项目进度统计
   */
  async getProjectProgressStats(projectId) {
    // 里程碑统计
    const milestoneStats = await Milestone.aggregate([
      {
        $match: { project: projectId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // 任务统计
    const taskStats = await Task.aggregate([
      {
        $match: { project: projectId }
      },
      {
        $group: {
          _id: {
            status: '$status',
            priority: '$priority'
          },
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalActualHours: { $sum: '$actualHours' }
        }
      }
    ]);

    // 问题统计
    const issueStats = await Task.aggregate([
      {
        $match: { project: projectId }
      },
      {
        $unwind: '$issues'
      },
      {
        $group: {
          _id: {
            severity: '$issues.severity',
            status: '$issues.status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      milestoneStats,
      taskStats,
      issueStats
    };
  }
}

module.exports = { ProgressProvider }; 