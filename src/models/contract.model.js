/**
 * 合同管理模型
 */
const mongoose = require('mongoose');

// 合同模式
const contractSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  code: {
    type: String,
    required: [true, '合同编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '合同名称是必需的'],
    trim: true
  },
  type: {
    type: String,
    required: [true, '合同类型是必需的'],
    enum: [
      'main',           // 主合同
      'subcontract',    // 分包合同
      'supply',         // 供应合同
      'service',        // 服务合同
      'lease',          // 租赁合同
      'other'           // 其他合同
    ]
  },
  description: String,

  // 合同方信息
  partyA: {
    company: {
      type: String,
      required: [true, '甲方公司名称是必需的']
    },
    representative: String,
    contact: String,
    phone: String,
    email: String,
    address: String
  },
  partyB: {
    company: {
      type: String,
      required: [true, '乙方公司名称是必需的']
    },
    representative: String,
    contact: String,
    phone: String,
    email: String,
    address: String
  },

  // 合同金额
  amount: {
    value: {
      type: Number,
      required: [true, '合同金额是必需的'],
      min: [0, '合同金额不能为负数']
    },
    currency: {
      type: String,
      default: 'CNY'
    },
    tax: {
      rate: Number,
      amount: Number
    }
  },

  // 合同期限
  term: {
    startDate: {
      type: Date,
      required: [true, '合同开始日期是必需的']
    },
    endDate: {
      type: Date,
      required: [true, '合同结束日期是必需的']
    },
    isLongTerm: Boolean,  // 是否长期合同
    autoRenew: Boolean    // 是否自动续期
  },

  // 付款条款
  paymentTerms: {
    method: {
      type: String,
      enum: ['advance', 'installment', 'milestone', 'completion'],
      required: [true, '付款方式是必需的']
    },
    installments: [{
      name: String,
      percentage: Number,
      amount: Number,
      dueDate: Date,
      conditions: String
    }],
    depositRequired: Boolean,
    depositAmount: Number,
    depositDueDate: Date
  },

  // 履约保证
  performance: {
    bondRequired: Boolean,
    bondType: {
      type: String,
      enum: ['cash', 'bank_guarantee', 'insurance']
    },
    bondAmount: Number,
    bondProvider: String,
    bondStartDate: Date,
    bondEndDate: Date
  },

  // 质保信息
  warranty: {
    period: Number,  // 质保期(月)
    startDate: Date,
    endDate: Date,
    conditions: String
  },

  // 合同文档
  documents: [{
    type: {
      type: String,
      enum: ['main', 'appendix', 'attachment', 'amendment']
    },
    name: String,
    url: String,
    version: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 合同状态
  status: {
    type: String,
    enum: [
      'draft',        // 草稿
      'review',       // 审核中
      'negotiation',  // 谈判中
      'pending',      // 待签署
      'active',       // 执行中
      'completed',    // 已完成
      'terminated',   // 已终止
      'cancelled'     // 已取消
    ],
    default: 'draft'
  },

  // 审批信息
  approval: {
    required: Boolean,
    level: Number,
    approvers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      date: Date,
      comments: String
    }],
    finalApproval: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      date: Date,
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },

  // 签署信息
  signing: {
    method: {
      type: String,
      enum: ['physical', 'electronic']
    },
    date: Date,
    location: String,
    partyASignatory: {
      name: String,
      title: String,
      date: Date
    },
    partyBSignatory: {
      name: String,
      title: String,
      date: Date
    },
    witnesses: [{
      name: String,
      title: String,
      organization: String
    }]
  },

  // 变更记录
  changes: [{
    type: {
      type: String,
      enum: ['amendment', 'supplement', 'termination']
    },
    code: String,
    description: String,
    reason: String,
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'rejected']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    documents: [{
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: Date
    }]
  }],

  // 履约记录
  performance: [{
    date: Date,
    type: {
      type: String,
      enum: ['milestone', 'delivery', 'acceptance', 'issue']
    },
    description: String,
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'delayed', 'issue']
    },
    plannedDate: Date,
    actualDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [{
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: Date
    }]
  }],

  // 风险记录
  risks: [{
    type: {
      type: String,
      enum: ['legal', 'financial', 'technical', 'schedule', 'other']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    impact: String,
    mitigation: String,
    status: {
      type: String,
      enum: ['identified', 'analyzing', 'mitigating', 'resolved']
    },
    identifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    identifiedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
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

// 付款记录模式
const paymentSchema = new mongoose.Schema({
  // 基本信息
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, '合同ID是必需的']
  },
  code: {
    type: String,
    required: [true, '付款编号是必需的'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, '付款类型是必需的'],
    enum: [
      'deposit',       // 定金
      'advance',       // 预付款
      'progress',      // 进度款
      'milestone',     // 里程碑付款
      'final',         // 尾款
      'retention'      // 质保金
    ]
  },

  // 付款金额
  amount: {
    planned: {
      type: Number,
      required: [true, '计划付款金额是必需的'],
      min: [0, '付款金额不能为负数']
    },
    actual: Number,
    currency: {
      type: String,
      default: 'CNY'
    },
    exchangeRate: Number
  },

  // 付款计划
  plannedDate: {
    type: Date,
    required: [true, '计划付款日期是必需的']
  },
  actualDate: Date,

  // 付款条件
  conditions: {
    description: String,
    documents: [{
      type: String,
      required: String,
      submitted: Boolean,
      submittedAt: Date,
      verified: Boolean,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date
    }],
    fulfilled: Boolean,
    fulfilledAt: Date
  },

  // 发票信息
  invoice: {
    required: Boolean,
    number: String,
    date: Date,
    amount: Number,
    taxRate: Number,
    taxAmount: Number,
    received: Boolean,
    receivedAt: Date,
    attachment: {
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: Date
    }
  },

  // 支付信息
  payment: {
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'check']
    },
    bankAccount: {
      bank: String,
      account: String,
      holder: String
    },
    reference: String,
    proof: {
      name: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: Date
    }
  },

  // 审批信息
  approval: {
    required: Boolean,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    comments: String
  },

  // 状态
  status: {
    type: String,
    enum: [
      'planned',      // 已计划
      'processing',   // 处理中
      'paid',         // 已支付
      'cancelled'     // 已取消
    ],
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

// 变更单模式
const changeOrderSchema = new mongoose.Schema({
  // 基本信息
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, '合同ID是必需的']
  },
  code: {
    type: String,
    required: [true, '变更单编号是必需的'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, '变更类型是必需的'],
    enum: [
      'scope',        // 范围变更
      'schedule',     // 工期变更
      'price',        // 价格变更
      'technical',    // 技术变更
      'other'         // 其他变更
    ]
  },
  title: {
    type: String,
    required: [true, '变更标题是必需的'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '变更描述是必需的']
  },

  // 变更原因
  reason: {
    type: String,
    required: [true, '变更原因是必需的']
  },
  initiator: {
    party: {
      type: String,
      enum: ['partyA', 'partyB']
    },
    department: String,
    contact: String
  },

  // 变更影响
  impact: {
    scope: {
      description: String,
      attachments: [{
        name: String,
        url: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        uploadedAt: Date
      }]
    },
    schedule: {
      delay: Number,  // 延期天数
      newEndDate: Date,
      description: String
    },
    cost: {
      original: Number,
      change: Number,
      new: Number,
      breakdown: String
    },
    quality: String,
    risk: String
  },

  // 变更文档
  documents: [{
    type: {
      type: String,
      enum: ['request', 'analysis', 'quotation', 'drawing', 'other']
    },
    name: String,
    url: String,
    version: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // 审批流程
  approval: {
    workflow: [{
      step: Number,
      role: String,
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      date: Date,
      comments: String
    }],
    status: {
      type: String,
      enum: ['draft', 'reviewing', 'approved', 'rejected'],
      default: 'draft'
    },
    finalApproval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date,
      comments: String
    }
  },

  // 实施信息
  implementation: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled']
    },
    startDate: Date,
    completionDate: Date,
    verification: {
      required: Boolean,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
      result: {
        type: String,
        enum: ['accepted', 'rejected']
      },
      comments: String
    }
  },

  // 状态
  status: {
    type: String,
    enum: [
      'draft',        // 草稿
      'submitted',    // 已提交
      'reviewing',    // 审核中
      'approved',     // 已批准
      'rejected',     // 已拒绝
      'cancelled'     // 已取消
    ],
    default: 'draft'
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
contractSchema.index({ code: 1 }, { unique: true });
contractSchema.index({ project: 1, type: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ 'partyB.company': 1 });

paymentSchema.index({ code: 1 }, { unique: true });
paymentSchema.index({ contract: 1, type: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ plannedDate: 1 });

changeOrderSchema.index({ code: 1 }, { unique: true });
changeOrderSchema.index({ contract: 1, type: 1 });
changeOrderSchema.index({ status: 1 });

// 创建模型
const Contract = mongoose.model('Contract', contractSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const ChangeOrder = mongoose.model('ChangeOrder', changeOrderSchema);

module.exports = {
  Contract,
  Payment,
  ChangeOrder
}; 