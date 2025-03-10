/**
 * 进度管理模型
 */
const mongoose = require('mongoose');

// 里程碑模式
const milestoneSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: [true, '里程碑名称是必需的'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },

  // 时间信息
  plannedStartDate: {
    type: Date,
    required: [true, '计划开始日期是必需的']
  },
  plannedEndDate: {
    type: Date,
    required: [true, '计划结束日期是必需的']
  },
  actualStartDate: Date,
  actualEndDate: Date,

  // 进度信息
  progress: {
    type: Number,
    default: 0,
    min: [0, '进度不能小于0'],
    max: [100, '进度不能大于100']
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'delayed', 'cancelled'],
    default: 'not_started'
  },
  delayReason: String,

  // 依赖关系
  dependencies: [{
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone'
    },
    type: {
      type: String,
      enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
      default: 'finish_to_start'
    }
  }],

  // 关联信息
  responsiblePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '负责人是必需的']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // 文档信息
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 备注
  notes: String,

  // 创建和更新信息
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 任务模式
const taskSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: [true, '任务名称是必需的'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: [true, '里程碑ID是必需的']
  },

  // 时间信息
  plannedStartDate: {
    type: Date,
    required: [true, '计划开始日期是必需的']
  },
  plannedEndDate: {
    type: Date,
    required: [true, '计划结束日期是必需的']
  },
  actualStartDate: Date,
  actualEndDate: Date,
  estimatedHours: {
    type: Number,
    min: [0, '预计工时不能小于0']
  },
  actualHours: {
    type: Number,
    min: [0, '实际工时不能小于0']
  },

  // 进度信息
  progress: {
    type: Number,
    default: 0,
    min: [0, '进度不能小于0'],
    max: [100, '进度不能大于100']
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'delayed', 'cancelled'],
    default: 'not_started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  delayReason: String,

  // 依赖关系
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
      default: 'finish_to_start'
    }
  }],

  // 关联信息
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '执行人是必需的']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // 资源信息
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    plannedQuantity: Number,
    actualQuantity: Number
  }],
  equipment: [{
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    },
    plannedHours: Number,
    actualHours: Number
  }],

  // 问题和风险
  issues: [{
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed']
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    solution: String
  }],

  // 文档信息
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 备注
  notes: String,

  // 创建和更新信息
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
milestoneSchema.index({ project: 1, plannedStartDate: 1 });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ responsiblePerson: 1 });

taskSchema.index({ project: 1, milestone: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ priority: 1 });

// 方法
milestoneSchema.methods.updateProgress = async function() {
  const tasks = await Task.find({ milestone: this._id });
  if (tasks.length === 0) return;

  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  this.progress = Math.round(totalProgress / tasks.length);

  if (this.progress === 100) {
    this.status = 'completed';
    this.actualEndDate = new Date();
  } else if (this.progress > 0) {
    this.status = 'in_progress';
    if (!this.actualStartDate) {
      this.actualStartDate = new Date();
    }
  }

  await this.save();
};

taskSchema.methods.addIssue = async function(issueData) {
  this.issues.push(issueData);
  await this.save();
  return this;
};

taskSchema.methods.resolveIssue = async function(issueId, resolution) {
  const issue = this.issues.id(issueId);
  if (!issue) throw new Error('问题不存在');

  issue.status = 'resolved';
  issue.solution = resolution.solution;
  issue.resolvedBy = resolution.resolvedBy;
  issue.resolvedAt = new Date();

  await this.save();
  return this;
};

// 创建模型
const Milestone = mongoose.model('Milestone', milestoneSchema);
const Task = mongoose.model('Task', taskSchema);

module.exports = {
  Milestone,
  Task
}; 