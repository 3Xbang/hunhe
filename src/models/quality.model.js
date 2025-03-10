/**
 * 质量管理模型
 */
const mongoose = require('mongoose');

// 质量标准模式
const standardSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: [true, '标准名称是必需的'],
    trim: true
  },
  code: {
    type: String,
    required: [true, '标准编号是必需的'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, '标准类别是必需的'],
    enum: [
      'material',      // 材料标准
      'construction',  // 施工标准
      'acceptance',    // 验收标准
      'safety',        // 安全标准
      'environmental', // 环保标准
      'other'         // 其他标准
    ]
  },
  description: {
    type: String,
    trim: true
  },
  version: {
    type: String,
    required: [true, '版本号是必需的'],
    trim: true
  },
  effectiveDate: {
    type: Date,
    required: [true, '生效日期是必需的']
  },
  expiryDate: Date,

  // 标准内容
  requirements: [{
    item: {
      type: String,
      required: true
    },
    description: String,
    acceptanceCriteria: String,
    inspectionMethod: String,
    frequency: String
  }],

  // 适用范围
  applicableProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  applicableMaterials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
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

  // 状态信息
  status: {
    type: String,
    enum: ['draft', 'active', 'deprecated', 'archived'],
    default: 'draft'
  },

  // 审批信息
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  approvalNotes: String,

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

// 质量检查模式
const inspectionSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  type: {
    type: String,
    required: [true, '检查类型是必需的'],
    enum: [
      'material',      // 材料检查
      'construction',  // 施工检查
      'acceptance',    // 验收检查
      'safety',        // 安全检查
      'environmental', // 环保检查
      'other'         // 其他检查
    ]
  },
  name: {
    type: String,
    required: [true, '检查名称是必需的'],
    trim: true
  },
  description: String,
  location: String,

  // 检查标准
  standards: [{
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Standard',
      required: true
    },
    requirements: [{
      item: String,
      result: {
        type: String,
        enum: ['pass', 'fail', 'na'],
        required: true
      },
      value: String,
      remarks: String
    }]
  }],

  // 检查对象
  materials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: Number,
    batch: String
  }],
  equipment: [{
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    }
  }],

  // 检查结果
  result: {
    type: String,
    enum: ['pass', 'conditional_pass', 'fail'],
    required: [true, '检查结果是必需的']
  },
  score: {
    type: Number,
    min: [0, '分数不能小于0'],
    max: [100, '分数不能大于100']
  },
  findings: [{
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    recommendation: String,
    deadline: Date
  }],

  // 整改信息
  improvements: [{
    finding: {
      type: mongoose.Schema.Types.ObjectId
    },
    action: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'verified'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deadline: Date,
    completedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    remarks: String
  }],

  // 文档信息
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['photo', 'report', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 检查人员
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '检查人是必需的']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // 时间信息
  plannedDate: {
    type: Date,
    required: [true, '计划检查日期是必需的']
  },
  actualDate: Date,
  duration: Number,  // 检查时长(分钟)

  // 审核信息
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,

  // 状态信息
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },

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

// 质量问题模式
const issueSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  type: {
    type: String,
    required: [true, '问题类型是必需的'],
    enum: [
      'material',      // 材料问题
      'construction',  // 施工问题
      'design',        // 设计问题
      'equipment',     // 设备问题
      'environmental', // 环境问题
      'other'         // 其他问题
    ]
  },
  title: {
    type: String,
    required: [true, '问题标题是必需的'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '问题描述是必需的'],
    trim: true
  },
  location: String,

  // 问题详情
  severity: {
    type: String,
    required: [true, '严重程度是必需的'],
    enum: ['low', 'medium', 'high', 'critical']
  },
  impact: {
    schedule: Boolean,    // 影响进度
    cost: Boolean,        // 影响成本
    quality: Boolean,     // 影响质量
    safety: Boolean       // 影响安全
  },
  rootCause: String,      // 根本原因
  preventiveMeasures: String,  // 预防措施

  // 相关信息
  relatedInspection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection'
  },
  relatedMaterials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  relatedEquipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],

  // 处理信息
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '处理人是必需的']
  },
  deadline: {
    type: Date,
    required: [true, '处理期限是必需的']
  },
  solution: String,
  result: String,

  // 文档信息
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['photo', 'report', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 状态信息
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'open'
  },
  resolvedAt: Date,
  closedAt: Date,

  // 验证信息
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationResult: {
    type: String,
    enum: ['accepted', 'rejected']
  },
  verificationNotes: String,

  // 成本信息
  cost: {
    estimated: Number,
    actual: Number,
    currency: {
      type: String,
      default: 'CNY'
    }
  },

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

// 改进措施模式
const improvementSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  type: {
    type: String,
    required: [true, '改进类型是必需的'],
    enum: [
      'process',       // 流程改进
      'technology',    // 技术改进
      'management',    // 管理改进
      'training',      // 培训改进
      'other'         // 其他改进
    ]
  },
  title: {
    type: String,
    required: [true, '改进标题是必需的'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '改进描述是必需的'],
    trim: true
  },

  // 改进目标
  objectives: [{
    description: String,
    metric: String,
    target: String,
    actual: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'achieved', 'not_achieved'],
      default: 'pending'
    }
  }],

  // 实施计划
  actions: [{
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    plannedStartDate: Date,
    plannedEndDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    result: String
  }],

  // 相关信息
  relatedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  relatedInspections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection'
  }],

  // 资源信息
  resources: {
    budget: Number,
    actualCost: Number,
    manpower: Number,
    equipment: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    }],
    materials: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    }]
  },

  // 文档信息
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['plan', 'report', 'photo', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

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

  // 负责人信息
  responsiblePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '负责人是必需的']
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // 评估信息
  evaluation: {
    effectiveness: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    costEfficiency: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    sustainability: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    comments: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date
  },

  // 状态信息
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },

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
standardSchema.index({ code: 1 }, { unique: true });
standardSchema.index({ category: 1 });
standardSchema.index({ status: 1 });

inspectionSchema.index({ project: 1, type: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ inspector: 1 });
inspectionSchema.index({ plannedDate: 1 });

issueSchema.index({ project: 1, type: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ assignedTo: 1 });

improvementSchema.index({ project: 1, type: 1 });
improvementSchema.index({ status: 1 });
improvementSchema.index({ responsiblePerson: 1 });

// 创建模型
const Standard = mongoose.model('Standard', standardSchema);
const Inspection = mongoose.model('Inspection', inspectionSchema);
const Issue = mongoose.model('Issue', issueSchema);
const Improvement = mongoose.model('Improvement', improvementSchema);

module.exports = {
  Standard,
  Inspection,
  Issue,
  Improvement
}; 