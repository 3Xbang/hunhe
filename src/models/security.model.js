/**
 * 安全管理模型
 */
const mongoose = require('mongoose');

// 风险评估模式
const riskAssessmentSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  code: {
    type: String,
    required: [true, '评估编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '评估名称是必需的'],
    trim: true
  },
  type: {
    type: String,
    required: [true, '评估类型是必需的'],
    enum: [
      'routine',      // 常规评估
      'special',      // 专项评估
      'emergency',    // 应急评估
      'acceptance'    // 验收评估
    ]
  },
  
  // 评估范围
  scope: {
    areas: [String],      // 评估区域
    activities: [String], // 评估活动
    personnel: [String]   // 相关人员
  },
  
  // 风险项
  risks: [{
    category: {
      type: String,
      enum: [
        'personnel',    // 人员安全
        'equipment',    // 设备安全
        'environment',  // 环境安全
        'operation',    // 操作安全
        'material',     // 材料安全
        'other'         // 其他
      ]
    },
    name: String,
    description: String,
    likelihood: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    impact: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical']
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme']
    },
    controls: [{
      measure: String,
      responsible: String,
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'overdue']
      }
    }]
  }],
  
  // 评估结果
  result: {
    overallRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme']
    },
    findings: String,
    recommendations: String
  },
  
  // 评估状态
  status: {
    type: String,
    enum: [
      'planned',     // 已计划
      'in_progress', // 进行中
      'completed',   // 已完成
      'reviewed',    // 已审核
      'cancelled'    // 已取消
    ],
    default: 'planned'
  },
  
  // 评估时间
  plannedDate: {
    type: Date,
    required: true
  },
  actualDate: Date,
  completionDate: Date,
  
  // 评估人员
  assessors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  
  // 审核信息
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    }
  },
  
  // 附件
  attachments: [{
    name: String,
    url: String,
    type: String,
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

// 安全事故模式
const incidentSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  code: {
    type: String,
    required: [true, '事故编号是必需的'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, '事故类型是必需的'],
    enum: [
      'injury',        // 人员伤害
      'equipment',     // 设备损坏
      'fire',         // 火灾
      'explosion',    // 爆炸
      'spill',        // 泄漏
      'collapse',     // 坍塌
      'electric',     // 触电
      'other'         // 其他
    ]
  },
  
  // 事故信息
  severity: {
    type: String,
    required: [true, '事故等级是必需的'],
    enum: ['minor', 'moderate', 'major', 'critical']
  },
  location: {
    type: String,
    required: [true, '事故地点是必需的']
  },
  date: {
    type: Date,
    required: [true, '事故日期是必需的']
  },
  description: {
    type: String,
    required: [true, '事故描述是必需的']
  },
  
  // 伤亡情况
  casualties: {
    deaths: {
      type: Number,
      default: 0
    },
    injuries: {
      type: Number,
      default: 0
    },
    details: String
  },
  
  // 损失情况
  losses: {
    direct: Number,    // 直接经济损失
    indirect: Number,  // 间接经济损失
    details: String
  },
  
  // 事故原因
  causes: {
    immediate: String,  // 直接原因
    root: String,       // 根本原因
    contributing: String // 促成因素
  },
  
  // 处理措施
  responses: [{
    action: String,
    responsible: String,
    deadline: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed']
    },
    completedAt: Date,
    result: String
  }],
  
  // 预防措施
  preventions: [{
    measure: String,
    responsible: String,
    deadline: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed']
    }
  }],
  
  // 事故状态
  status: {
    type: String,
    enum: [
      'reported',    // 已报告
      'investigating', // 调查中
      'handling',    // 处理中
      'reviewing',   // 审核中
      'closed',      // 已关闭
      'reopened'     // 重新打开
    ],
    default: 'reported'
  },
  
  // 调查信息
  investigation: {
    team: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String
    }],
    startDate: Date,
    endDate: Date,
    findings: String,
    recommendations: String
  },
  
  // 审核信息
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    }
  },
  
  // 附件
  attachments: [{
    name: String,
    url: String,
    type: String,
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

// 安全检查模式
const inspectionSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  code: {
    type: String,
    required: [true, '检查编号是必需的'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, '检查类型是必需的'],
    enum: [
      'routine',     // 常规检查
      'special',     // 专项检查
      'random',      // 随机检查
      'followup'     // 复查
    ]
  },
  
  // 检查范围
  scope: {
    areas: [String],      // 检查区域
    items: [String],      // 检查项目
    standards: [String]   // 检查标准
  },
  
  // 检查结果
  items: [{
    category: String,
    item: String,
    standard: String,
    result: {
      type: String,
      enum: ['pass', 'fail', 'na']
    },
    findings: String,
    photos: [{
      url: String,
      description: String
    }],
    corrections: [{
      issue: String,
      deadline: Date,
      responsible: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'verified']
      },
      completedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date
    }]
  }],
  
  // 检查状态
  status: {
    type: String,
    enum: [
      'planned',     // 已计划
      'in_progress', // 进行中
      'completed',   // 已完成
      'reviewed',    // 已审核
      'closed'       // 已关闭
    ],
    default: 'planned'
  },
  
  // 检查时间
  plannedDate: {
    type: Date,
    required: true
  },
  actualDate: Date,
  completionDate: Date,
  
  // 检查人员
  inspectors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  
  // 检查结论
  conclusion: {
    result: {
      type: String,
      enum: ['pass', 'conditional_pass', 'fail']
    },
    summary: String,
    recommendations: String
  },
  
  // 审核信息
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    }
  },
  
  // 附件
  attachments: [{
    name: String,
    url: String,
    type: String,
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

// 安全培训模式
const trainingSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  code: {
    type: String,
    required: [true, '培训编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '培训名称是必需的'],
    trim: true
  },
  type: {
    type: String,
    required: [true, '培训类型是必需的'],
    enum: [
      'induction',    // 入场培训
      'regular',      // 定期培训
      'special',      // 专项培训
      'certification' // 证书培训
    ]
  },
  
  // 培训内容
  content: {
    topics: [String],
    objectives: [String],
    materials: [{
      name: String,
      url: String
    }]
  },
  
  // 培训安排
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    duration: Number,  // 培训时长(小时)
    location: String
  },
  
  // 培训人员
  trainers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    qualification: String
  }],
  
  // 参训人员
  trainees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: String,
    position: String,
    attendance: {
      type: String,
      enum: ['present', 'absent', 'late']
    },
    test: {
      score: Number,
      result: {
        type: String,
        enum: ['pass', 'fail']
      },
      certificate: {
        number: String,
        issueDate: Date,
        expiryDate: Date
      }
    }
  }],
  
  // 培训状态
  status: {
    type: String,
    enum: [
      'planned',     // 已计划
      'in_progress', // 进行中
      'completed',   // 已完成
      'evaluated',   // 已评估
      'cancelled'    // 已取消
    ],
    default: 'planned'
  },
  
  // 培训评估
  evaluation: {
    satisfaction: Number,  // 满意度评分
    effectiveness: Number, // 有效性评分
    feedback: String,      // 反馈意见
    improvements: String   // 改进建议
  },
  
  // 附件
  attachments: [{
    name: String,
    url: String,
    type: String,
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
riskAssessmentSchema.index({ code: 1 }, { unique: true });
riskAssessmentSchema.index({ project: 1, type: 1 });
riskAssessmentSchema.index({ status: 1 });

incidentSchema.index({ code: 1 }, { unique: true });
incidentSchema.index({ project: 1, type: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ date: 1 });

inspectionSchema.index({ code: 1 }, { unique: true });
inspectionSchema.index({ project: 1, type: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ plannedDate: 1 });

trainingSchema.index({ code: 1 }, { unique: true });
trainingSchema.index({ project: 1, type: 1 });
trainingSchema.index({ status: 1 });
trainingSchema.index({ 'schedule.startDate': 1 });

// 创建模型
const RiskAssessment = mongoose.model('RiskAssessment', riskAssessmentSchema);
const Incident = mongoose.model('Incident', incidentSchema);
const Inspection = mongoose.model('Inspection', inspectionSchema);
const Training = mongoose.model('Training', trainingSchema);

module.exports = {
  RiskAssessment,
  Incident,
  Inspection,
  Training
}; 