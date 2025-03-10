/**
 * 发票管理模型
 */
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  // 发票编号
  code: {
    type: String,
    required: true,
    unique: true
  },
  // 发票号码
  number: {
    type: String,
    required: true
  },
  // 发票类型：增值税专票/普票/其他
  type: {
    type: String,
    enum: ['vat_special', 'vat_normal', 'other'],
    required: true
  },
  // 关联项目
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // 供应商
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  // 开票日期
  issueDate: {
    type: Date,
    required: true
  },
  // 发票金额
  amount: {
    type: Number,
    required: true
  },
  // 税率
  taxRate: {
    type: Number,
    required: true
  },
  // 税额
  taxAmount: {
    type: Number,
    required: true
  },
  // 价税合计
  totalAmount: {
    type: Number,
    required: true
  },
  // 发票状态：待验证/已验证/已报销/已作废
  status: {
    type: String,
    enum: ['pending', 'verified', 'reimbursed', 'cancelled'],
    default: 'pending'
  },
  // 发票图片
  images: [{
    filename: String,
    originalname: String,
    path: String,
    size: Number,
    mimetype: String
  }],
  // 备注
  remarks: String,
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
invoiceSchema.index({ code: 1 });
invoiceSchema.index({ number: 1 });
invoiceSchema.index({ project: 1 });
invoiceSchema.index({ supplier: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = { Invoice }; 