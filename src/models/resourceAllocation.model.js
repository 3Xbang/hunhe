/**
 * 资源分配模型
 */
const mongoose = require('mongoose');

const resourceAllocationSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  resourceType: {
    type: String,
    required: [true, '资源类型是必需的'],
    enum: ['human', 'equipment', 'material']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel',
    required: [true, '资源ID是必需的']
  },
  resourceModel: {
    type: String,
    required: true,
    enum: ['User', 'Equipment', 'Material']
  },
  
  // 分配信息
  quantity: {
    type: Number,
    required: [true, '数量是必需的'],
    min: 0
  },
  unit: String,
  
  // 时间信息
  startDate: {
    type: Date,
    required: [true, '开始日期是必需的']
  },
  endDate: {
    type: Date,
    required: [true, '结束日期是必需的']
  },
  
  // 状态
  status: {
    type: String,
    enum: [
      'planned',     // 已计划
      'allocated',   // 已分配
      'in_use',      // 使用中
      'completed',   // 已完成
      'cancelled'    // 已取消
    ],
    default: 'planned'
  },
  
  // 使用记录
  usageRecords: [{
    date: Date,
    quantity: Number,
    hours: Number,
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // 成本信息
  cost: {
    planned: Number,
    actual: Number,
    unit: String
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
resourceAllocationSchema.index({ project: 1, resourceType: 1 });
resourceAllocationSchema.index({ resourceId: 1, startDate: 1, endDate: 1 });
resourceAllocationSchema.index({ status: 1 });

const ResourceAllocation = mongoose.model('ResourceAllocation', resourceAllocationSchema);

module.exports = { ResourceAllocation }; 