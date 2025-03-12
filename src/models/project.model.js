/**
 * 项目模型
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 项目状态
const PROJECT_STATUS = {
  PLANNING: 'planning',   // 规划中
  APPROVED: 'approved',   // 已批准
  IN_PROGRESS: 'inProgress', // 进行中
  COMPLETED: 'completed', // 已完成
  ON_HOLD: 'onHold',      // 暂停
  CANCELLED: 'cancelled'  // 已取消
};

// 项目类型
const PROJECT_TYPES = {
  RESIDENTIAL: 'residential', // 住宅
  COMMERCIAL: 'commercial',   // 商业
  INDUSTRIAL: 'industrial',   // 工业
  INFRASTRUCTURE: 'infrastructure', // 基础设施
  RENOVATION: 'renovation'    // 翻新
};

// 项目里程碑子模式
const milestoneSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  plannedStartDate: {
    type: Date,
    required: true
  },
  plannedEndDate: {
    type: Date,
    required: true
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'completed', 'delayed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// 项目模式
const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(PROJECT_TYPES),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.PLANNING
  },
  client: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'China'
    },
    coordinates: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  estimatedEndDate: {
    type: Date,
    required: true
  },
  actualEndDate: {
    type: Date
  },
  budget: {
    currency: {
      type: String,
      default: 'CNY'
    },
    planned: {
      type: Number,
      required: true,
      min: 0
    },
    actual: {
      type: Number,
      min: 0
    }
  },
  milestones: [milestoneSchema],
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String
    },
    size: {
      type: Number
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引设置
projectSchema.index({ name: 'text', 'client.name': 'text', code: 'text' });
projectSchema.index({ status: 1 });
projectSchema.index({ 'location.city': 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ isDeleted: 1 });

// 移除已删除项目的查询中间件
projectSchema.pre('find', function() {
  if (!this._conditions.isDeleted) {
    this._conditions.isDeleted = false;
  }
});

// 软删除方法
projectSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  return this.save();
};

// 计算项目进度的方法
projectSchema.methods.calculateProgress = function() {
  if (!this.milestones || this.milestones.length === 0) {
    return 0;
  }
  
  const totalProgress = this.milestones.reduce((sum, milestone) => sum + milestone.progress, 0);
  return Math.round(totalProgress / this.milestones.length);
};

// 更新项目进度的钩子
projectSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    this.progress = this.calculateProgress();
  }
  next();
});

// 创建和导出模型
const Project = mongoose.model('Project', projectSchema);

module.exports = {
  Project,
  PROJECT_STATUS,
  PROJECT_TYPES
}; 