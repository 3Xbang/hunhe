/**
 * 项目成本模型
 */
const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  type: {
    type: String,
    required: [true, '成本类型是必需的'],
    enum: [
      'labor',       // 人工成本
      'material',    // 材料成本
      'equipment',   // 设备成本
      'subcontract', // 分包成本
      'overhead',    // 管理费用
      'other'        // 其他成本
    ]
  },
  
  // 成本信息
  amount: {
    type: Number,
    required: [true, '金额是必需的'],
    min: 0
  },
  currency: {
    type: String,
    default: 'CNY'
  },
  
  // 时间信息
  date: {
    type: Date,
    required: [true, '日期是必需的']
  },
  
  // 相关信息
  description: {
    type: String,
    required: [true, '描述是必需的'],
    trim: true
  },
  category: {
    type: String,
    required: [true, '成本类别是必需的']
  },
  
  // 关联信息
  relatedResource: {
    resourceType: {
      type: String,
      enum: ['human', 'equipment', 'material', 'subcontractor']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedResource.resourceType'
    }
  },
  
  // 发票信息
  invoice: {
    number: String,
    date: Date,
    vendor: String,
    attachmentUrl: String
  },
  
  // 审核信息
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    comments: String
  },
  
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
costSchema.index({ project: 1, type: 1 });
costSchema.index({ date: 1 });
costSchema.index({ 'review.status': 1 });

const Cost = mongoose.model('Cost', costSchema);

module.exports = { Cost }; 