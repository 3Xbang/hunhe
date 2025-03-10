/**
 * 项目模型
 */
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // 基本信息
  code: {
    type: String,
    required: [true, '项目编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '项目名称是必需的'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, '项目类型是必需的'],
    enum: [
      'residential',    // 住宅
      'commercial',     // 商业
      'industrial',     // 工业
      'infrastructure', // 基础设施
      'renovation',     // 装修
      'other'          // 其他
    ]
  },

  // 客户信息
  client: {
    name: {
      type: String,
      required: [true, '客户名称是必需的']
    },
    contact: {
      name: String,
      phone: String,
      email: String
    },
    company: String
  },

  // 时间信息
  timeline: {
    plannedStart: {
      type: Date,
      required: [true, '计划开始日期是必需的']
    },
    plannedEnd: {
      type: Date,
      required: [true, '计划结束日期是必需的']
    },
    actualStart: Date,
    actualEnd: Date,
    milestones: [{
      name: String,
      plannedDate: Date,
      actualDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed'],
        default: 'pending'
      }
    }]
  },

  // 位置信息
  location: {
    address: {
      type: String,
      required: [true, '项目地址是必需的']
    },
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // 财务信息
  finance: {
    budget: {
      type: Number,
      required: [true, '项目预算是必需的'],
      min: 0
    },
    actualCost: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'CNY',
      enum: ['CNY', 'USD', 'EUR']
    },
    payments: [{
      amount: Number,
      date: Date,
      type: {
        type: String,
        enum: ['advance', 'progress', 'final']
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
      },
      notes: String
    }]
  },

  // 团队信息
  team: {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '项目经理是必需的']
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String,
      joinDate: Date,
      leaveDate: Date
    }]
  },

  // 材料清单
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    plannedQuantity: Number,
    actualQuantity: Number,
    status: {
      type: String,
      enum: ['pending', 'ordered', 'received', 'in_use', 'completed'],
      default: 'pending'
    }
  }],

  // 进度信息
  progress: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    phases: [{
      name: String,
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed'],
        default: 'pending'
      }
    }]
  },

  // 风险管理
  risks: [{
    description: String,
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    status: {
      type: String,
      enum: ['identified', 'monitored', 'mitigated', 'occurred'],
      default: 'identified'
    },
    mitigationPlan: String,
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // 质量控制
  quality: {
    inspections: [{
      date: Date,
      inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: String,
      result: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending'
      },
      notes: String,
      attachments: [String]  // 文档URL数组
    }],
    issues: [{
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved'],
        default: 'open'
      },
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedDate: Date,
      resolvedDate: Date,
      resolution: String
    }]
  },

  // 文档管理
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['contract', 'permit', 'drawing', 'report', 'other']
    },
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // 项目状态
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },

  // 备注
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 索引
projectSchema.index({ code: 1 }, { unique: true });
projectSchema.index({ name: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'team.manager': 1 });
projectSchema.index({ 'timeline.plannedStart': 1 });
projectSchema.index({ 'timeline.plannedEnd': 1 });

// 中间件
projectSchema.pre('save', async function(next) {
  if (this.isNew) {
    // 生成项目编号
    const type = this.type.substring(0, 2).toUpperCase();
    const count = await mongoose.model('Project').countDocuments();
    this.code = `${type}${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// 方法
projectSchema.methods.updateProgress = async function(phaseIndex, progress) {
  if (phaseIndex >= 0 && phaseIndex < this.progress.phases.length) {
    this.progress.phases[phaseIndex].progress = progress;
    
    // 更新总体进度
    const totalProgress = this.progress.phases.reduce((sum, phase) => sum + phase.progress, 0);
    this.progress.overall = totalProgress / this.progress.phases.length;
    
    await this.save();
  }
  return this.progress;
};

projectSchema.methods.addTeamMember = async function(memberData) {
  this.team.members.push({
    ...memberData,
    joinDate: new Date()
  });
  await this.save();
  return this.team;
};

projectSchema.methods.addMaterial = async function(materialData) {
  this.materials.push(materialData);
  await this.save();
  return this.materials;
};

projectSchema.methods.recordPayment = async function(paymentData) {
  this.finance.payments.push(paymentData);
  this.finance.actualCost += paymentData.amount;
  await this.save();
  return this.finance;
};

projectSchema.methods.addRisk = async function(riskData) {
  this.risks.push(riskData);
  await this.save();
  return this.risks;
};

projectSchema.methods.recordInspection = async function(inspectionData) {
  this.quality.inspections.push(inspectionData);
  await this.save();
  return this.quality.inspections;
};

projectSchema.methods.reportIssue = async function(issueData) {
  this.quality.issues.push({
    ...issueData,
    reportedDate: new Date()
  });
  await this.save();
  return this.quality.issues;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 