const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  // 预算编号
  code: {
    type: String,
    required: true,
    unique: true
  },

  // 预算年度
  year: {
    type: Number,
    required: true
  },

  // 预算月份
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },

  // 部门
  department: {
    type: String,
    required: true
  },

  // 预算类型
  type: {
    type: String,
    required: true,
    enum: ['department', 'project']
  },

  // 预算项目
  items: [{
    // 预算项目名称
    name: {
      type: String,
      required: true
    },
    // 预算类型：收入/支出
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense']
    },
    // 预算金额
    amount: {
      type: Number,
      required: true
    },
    // 实际金额
    actualAmount: {
      type: Number,
      default: 0
    },
    // 备注
    remarks: String
  }],

  // 预算总额
  totalAmount: {
    type: Number,
    required: true
  },

  // 实际总额
  totalActualAmount: {
    type: Number,
    default: 0
  },

  // 预算状态
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },

  // 审批信息
  approvalComment: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,

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

// 生成预算编号
budgetSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = this.year;
    const month = String(this.month).padStart(2, '0');
    const count = await mongoose.model('Budget').countDocuments({
      year: this.year,
      month: this.month
    });
    const sequence = String(count + 1).padStart(3, '0');
    this.code = `BG${year}${month}${sequence}`;
  }
  next();
});

// 计算总额
budgetSchema.pre('save', function(next) {
  // 计算预算总额
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.type === 'income' ? item.amount : -item.amount);
  }, 0);

  // 计算实际总额
  this.totalActualAmount = this.items.reduce((total, item) => {
    return total + (item.type === 'income' ? item.actualAmount : -item.actualAmount);
  }, 0);

  next();
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = { Budget }; 