/**
 * 付款管理模型
 */
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // 付款编号
  code: {
    type: String,
    required: true,
    unique: true
  },
  // 关联项目
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // 付款类型：预付款/进度款/结算款/其他
  type: {
    type: String,
    enum: ['advance', 'progress', 'settlement', 'other'],
    required: true
  },
  // 付款金额
  amount: {
    type: Number,
    required: true
  },
  // 收款方（供应商）
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  // 计划付款日期
  plannedDate: {
    type: Date,
    required: true
  },
  // 实际付款日期
  actualDate: Date,
  // 付款状态：待审批/已审批/已付款/已驳回
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending'
  },
  // 付款方式：银行转账/现金/支票
  method: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check'],
    required: true
  },
  // 关联发票
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  // 银行账户信息
  bankInfo: {
    accountName: String,
    bankName: String,
    accountNo: String
  },
  // 审批记录
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected']
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // 备注
  remarks: String,
  // 附件
  attachments: [{
    filename: String,
    originalname: String,
    path: String,
    size: Number,
    mimetype: String
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
paymentSchema.index({ code: 1 });
paymentSchema.index({ project: 1 });
paymentSchema.index({ payee: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ plannedDate: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = { Payment }; 