/**
 * 成本管理模型
 */
const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  // 成本编号
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
  // 成本类型：材料/设备/人工/其他
  type: {
    type: String,
    enum: ['material', 'equipment', 'labor', 'other'],
    required: true
  },
  // 成本项目
  item: {
    type: String,
    required: true
  },
  // 发生日期
  date: {
    type: Date,
    required: true
  },
  // 金额
  amount: {
    type: Number,
    required: true
  },
  // 关联预算项目
  budgetItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  // 供应商（如果适用）
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
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
costSchema.index({ code: 1 });
costSchema.index({ project: 1 });
costSchema.index({ type: 1 });
costSchema.index({ date: 1 });

const Cost = mongoose.model('Cost', costSchema);
module.exports = { Cost }; 