/**
 * 项目里程碑模型
 */
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  name: {
    type: String,
    required: [true, '里程碑名称是必需的'],
    trim: true
  },
  code: {
    type: String,
    required: [true, '里程碑编号是必需的'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // 时间信息
  plannedDate: {
    type: Date,
    required: [true, '计划日期是必需的']
  },
  actualDate: Date,
  
  // 进度信息
  weight: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: [
      'pending',     // 待开始
      'in_progress', // 进行中
      'completed',   // 已完成
      'delayed',     // 已延期
      'cancelled'    // 已取消
    ],
    default: 'pending'
  },
  
  // 负责人
  responsiblePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '负责人是必需的']
  },
  
  // 前置里程碑
  dependencies: [{
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone'
    },
    type: {
      type: String,
      enum: ['finish_to_start', 'start_to_start', 'finish_to_finish']
    }
  }],
  
  // 相关文档
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 备注
  notes: String,
  
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
milestoneSchema.index({ project: 1, plannedDate: 1 });
milestoneSchema.index({ code: 1 }, { unique: true });
milestoneSchema.index({ status: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = { Milestone }; 