/**
 * 风险模型
 */
const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, '项目ID是必填项']
    },
    name: {
      type: String,
      required: [true, '风险名称是必填项'],
      trim: true,
      maxlength: [100, '风险名称不能超过100个字符']
    },
    description: {
      type: String,
      required: [true, '风险描述是必填项'],
      maxlength: [1000, '风险描述不能超过1000个字符']
    },
    category: {
      type: String,
      enum: ['technical', 'schedule', 'cost', 'resource', 'quality', 'safety', 'other'],
      required: [true, '风险类别是必填项']
    },
    probability: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      required: [true, '发生概率是必填项']
    },
    impact: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      required: [true, '影响程度是必填项']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, '优先级是必填项']
    },
    status: {
      type: String,
      enum: ['identified', 'assessed', 'monitored', 'mitigated', 'closed', 'occurred'],
      default: 'identified'
    },
    identifiedDate: {
      type: Date,
      default: Date.now
    },
    expectedOccurrenceDate: {
      type: Date
    },
    actualOccurrenceDate: {
      type: Date
    },
    mitigationPlan: {
      strategy: {
        type: String,
        enum: ['avoid', 'transfer', 'mitigate', 'accept'],
        required: [true, '缓解策略是必填项']
      },
      actions: [{
        description: String,
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending'
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        dueDate: Date,
        completedDate: Date
      }],
      contingencyPlan: String,
      fallbackPlan: String
    },
    impacts: [{
      area: {
        type: String,
        enum: ['schedule', 'cost', 'quality', 'scope', 'resources', 'stakeholders']
      },
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }],
    triggers: [String],
    stakeholders: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String
    }],
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
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 索引
riskSchema.index({ project: 1, status: 1 });
riskSchema.index({ priority: 1 });
riskSchema.index({ category: 1 });
riskSchema.index({ createdAt: -1 });

// 虚拟字段：风险评分
riskSchema.virtual('riskScore').get(function() {
  const probabilityScore = {
    very_low: 1,
    low: 2,
    medium: 3,
    high: 4,
    very_high: 5
  };

  const impactScore = {
    very_low: 1,
    low: 2,
    medium: 3,
    high: 4,
    very_high: 5
  };

  return probabilityScore[this.probability] * impactScore[this.impact];
});

const Risk = mongoose.model('Risk', riskSchema);

module.exports = { Risk }; 