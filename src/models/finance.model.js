/**
 * 财务管理模型
 */
const mongoose = require('mongoose');

// 收支记录模式
const transactionSchema = new mongoose.Schema({
  // 基本信息
  type: {
    type: String,
    required: [true, '交易类型是必需的'],
    enum: ['income', 'expense']  // 收入/支出
  },
  category: {
    type: String,
    required: [true, '交易类别是必需的'],
    enum: [
      // 收入类别
      'project_payment',      // 项目款项
      'equipment_rental',     // 设备租赁
      'material_sale',        // 材料销售
      'compensation',         // 赔偿金
      'other_income',         // 其他收入
      
      // 支出类别
      'material_purchase',    // 材料采购
      'equipment_purchase',   // 设备购置
      'labor_cost',          // 人工成本
      'subcontract',         // 分包费用
      'equipment_maintenance',// 设备维护
      'office_expense',      // 办公费用
      'travel_expense',      // 差旅费用
      'insurance',           // 保险费用
      'tax',                 // 税费
      'other_expense'        // 其他支出
    ]
  },
  amount: {
    type: Number,
    required: [true, '金额是必需的'],
    min: [0, '金额必须是正数']
  },
  date: {
    type: Date,
    required: [true, '交易日期是必需的'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, '交易描述是必需的'],
    trim: true
  },

  // 关联信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },

  // 支付信息
  paymentMethod: {
    type: String,
    required: [true, '支付方式是必需的'],
    enum: ['cash', 'bank_transfer', 'check', 'credit_card', 'other']
  },
  paymentStatus: {
    type: String,
    required: [true, '支付状态是必需的'],
    enum: ['pending', 'partial', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentDate: Date,
  dueDate: Date,

  // 发票信息
  invoice: {
    number: String,
    date: Date,
    amount: Number,
    tax: Number,
    url: String  // 发票文件URL
  },

  // 合同信息
  contract: {
    number: String,
    name: String,
    url: String  // 合同文件URL
  },

  // 审批信息
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
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

// 预算模式
const budgetSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  year: {
    type: Number,
    required: [true, '年份是必需的']
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },

  // 收入预算
  plannedIncome: [{
    category: {
      type: String,
      required: true,
      enum: [
        'project_payment',
        'equipment_rental',
        'material_sale',
        'compensation',
        'other_income'
      ]
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: String
  }],

  // 支出预算
  plannedExpense: [{
    category: {
      type: String,
      required: true,
      enum: [
        'material_purchase',
        'equipment_purchase',
        'labor_cost',
        'subcontract',
        'equipment_maintenance',
        'office_expense',
        'travel_expense',
        'insurance',
        'tax',
        'other_expense'
      ]
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: String
  }],

  // 总计
  totalPlannedIncome: {
    type: Number,
    default: 0
  },
  totalPlannedExpense: {
    type: Number,
    default: 0
  },
  totalActualIncome: {
    type: Number,
    default: 0
  },
  totalActualExpense: {
    type: Number,
    default: 0
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

// 索引
transactionSchema.index({ project: 1, date: -1 });
transactionSchema.index({ type: 1, category: 1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ approvalStatus: 1 });

budgetSchema.index({ project: 1, year: 1, month: 1 }, { unique: true });
budgetSchema.index({ status: 1 });

// 预算模式中间件
budgetSchema.pre('save', function(next) {
  // 计算总计划收入
  this.totalPlannedIncome = this.plannedIncome.reduce((total, item) => {
    return total + item.amount;
  }, 0);

  // 计算总计划支出
  this.totalPlannedExpense = this.plannedExpense.reduce((total, item) => {
    return total + item.amount;
  }, 0);

  next();
});

// 方法
transactionSchema.statics.getProjectTransactions = async function(projectId, query = {}) {
  const {
    startDate,
    endDate,
    type,
    category,
    paymentStatus,
    approvalStatus
  } = query;

  const filter = { project: projectId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (approvalStatus) filter.approvalStatus = approvalStatus;

  return await this.find(filter)
    .populate('supplier', 'name code')
    .populate('equipment', 'name code')
    .populate('approvedBy', 'name')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ date: -1 });
};

budgetSchema.statics.getProjectBudgets = async function(projectId, year) {
  return await this.find({ project: projectId, year })
    .populate('approvedBy', 'name')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ month: 1 });
};

// 创建模型
const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);

module.exports = {
  Transaction,
  Budget
}; 