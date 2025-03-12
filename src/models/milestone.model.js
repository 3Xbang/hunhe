/**
 * 项目里程碑模型
 */
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必填项']
  },
  name: {
    type: String,
    required: [true, '里程碑名称是必填项'],
    trim: true,
    maxlength: [100, '里程碑名称不能超过100个字符']
  },
  code: {
    type: String,
    required: [true, '里程碑编号是必需的'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, '里程碑描述不能超过500个字符']
  },
  
  // 时间信息
  plannedDate: {
    type: Date,
    required: [true, '计划完成日期是必填项']
  },
  actualDate: {
    type: Date
  },
  
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
    enum: ['pending', 'in_progress', 'completed', 'delayed'],
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
      enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
      default: 'finish_to_start'
    }
  }],
  
  // 相关文档
  attachments: [{
    name: String,
    file: {
      url: String,
      key: String
    },
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
  },
  
  // 交付物
  deliverables: [{
    name: String,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    }
  }],
  
  // 分配给
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // 评论
  comments: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
milestoneSchema.index({ project: 1, plannedDate: 1 });
milestoneSchema.index({ code: 1 }, { unique: true });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ createdAt: -1 });

// 虚拟字段：延迟天数
milestoneSchema.virtual('delayDays').get(function() {
  if (this.actualDate && this.plannedDate) {
    return Math.ceil((this.actualDate - this.plannedDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = { Milestone }; 