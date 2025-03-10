/**
 * 项目风险模型
 */
const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  // 基本信息
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, '项目ID是必需的']
  },
  code: {
    type: String,
    required: [true, '风险编号是必需的'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, '风险标题是必需的'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '风险描述是必需的'],
    trim: true
  },
  
  // 风险分类
  type: {
    type: String,
    required: [true, '风险类型是必需的'],
    enum: [
      'technical',   // 技术风险
      'schedule',    // 进度风险
      'cost',        // 成本风险
      'resource',    // 资源风险
      'quality',     // 质量风险
      'other'        // 其他风险
    ]
  },
  
  // 风险评估
  probability: {
    type: String,
    required: [true, '发生概率是必需的'],
    enum: ['low', 'medium', 'high']
  },
  impact: {
    type: String,
    required: [true, '影响程度是必需的'],
    enum: ['minor', 'moderate', 'major', 'critical']
  },
  level: {
    type: String,
    required: [true, '风险等级是必需的'],
    enum: ['low', 'medium', 'high', 'extreme']
  },
  
  // 风险状态
  status: {
    type: String,
    enum: [
      'identified',   // 已识别
      'analyzing',    // 分析中
      'responding',   // 应对中
      'monitoring',   // 监控中
      'closed',       // 已关闭
      'occurred'      // 已发生
    ],
    default: 'identified'
  },
  
  // 应对措施
  response: {
    strategy: {
      type: String,
      enum: [
        'avoid',      // 规避
        'transfer',   // 转移
        'mitigate',   // 减轻
        'accept'      // 接受
      ]
    },
    actions: [{
      description: String,
      responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed']
      },
      completedAt: Date
    }]
  },
  
  // 跟踪记录
  trackingRecords: [{
    date: {
      type: Date,
      default: Date.now
    },
    status: String,
    description: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
  
  // 负责人
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
riskSchema.index({ project: 1, level: 1 });
riskSchema.index({ code: 1 }, { unique: true });
riskSchema.index({ status: 1 });
riskSchema.index({ type: 1 });

const Risk = mongoose.model('Risk', riskSchema);

module.exports = { Risk }; 