/**
 * 预算管理模型
 */
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  // 预算编号
  code: {
    type: String,
    required: true,
    unique: true
  },
  // 预算名称
  name: {
    type: String,
    required: true
  },
  // 关联项目
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // 预算年度
  year: {
    type: Number,
    required: true
  },
  // 预算类型：项目预算/部门预算
  type: {
    type: String,
    enum: ['project', 'department'],
    required: true
  },
  // 预算金额
  amount: {
    type: Number,
    required: true
  },
  // 已使用金额
  usedAmount: {
    type: Number,
    default: 0
  },
  // 预算项目明细
  items: [{
    // 预算项目名称
    name: String,
    // 预算类别
    category: String,
    // 计划金额
    plannedAmount: Number,
    // 已用金额
    actualAmount: {
      type: Number,
      default: 0
    },
    // 备注
    remarks: String
  }],
  // 预算状态：草稿/待审批/已审批/已驳回
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  // 审批记录
  approvals: [{
    // 审批人
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // 审批状态
    status: {
      type: String,
      enum: ['approved', 'rejected']
    },
    // 审批意见
    comments: String,
    // 审批时间
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // 创建人
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 更新人
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 添加索引
budgetSchema.index({ code: 1 });
budgetSchema.index({ project: 1 });
budgetSchema.index({ year: 1 });
budgetSchema.index({ status: 1 });

// 虚拟字段：剩余金额
budgetSchema.virtual('remainingAmount').get(function() {
  return this.amount - this.usedAmount;
});

// 虚拟字段：使用比例
budgetSchema.virtual('usageRate').get(function() {
  return (this.usedAmount / this.amount * 100).toFixed(2);
});

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = { Budget }; 