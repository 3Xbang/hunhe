/**
 * 交易记录模型
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // 交易编号
  code: {
    type: String,
    required: true,
    unique: true
  },

  // 交易类型：收入/支出
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },

  // 交易金额
  amount: {
    type: Number,
    required: true
  },

  // 交易日期
  date: {
    type: Date,
    required: true
  },

  // 交易描述
  description: {
    type: String,
    required: true
  },

  // 参考号（如发票号、合同号等）
  reference: {
    type: String
  },

  // 发票信息
  invoice: {
    number: String,
    date: Date,
    file: {
      url: String,
      key: String
    }
  },

  // 合同信息
  contract: {
    number: String,
    date: Date,
    file: {
      url: String,
      key: String
    }
  },

  // 交易状态
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },

  // 状态更新信息
  statusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statusUpdatedAt: Date,

  // 审批状态
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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

// 生成交易编号
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Transaction').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    });
    const sequence = String(count + 1).padStart(4, '0');
    this.code = `TR${year}${month}${sequence}`;
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction }; 
module.exports = mongoose.model('Transaction', transactionSchema); 