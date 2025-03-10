/**
 * 设备管理模型
 */
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  // 基本信息
  code: {
    type: String,
    required: [true, '设备编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '设备名称是必需的'],
    trim: true
  },
  model: {
    type: String,
    required: [true, '设备型号是必需的'],
    trim: true
  },
  category: {
    type: String,
    required: [true, '设备类别是必需的'],
    enum: [
      'machinery',      // 机械设备
      'electrical',     // 电气设备
      'measurement',    // 测量设备
      'safety',         // 安全设备
      'transportation', // 运输设备
      'other'          // 其他设备
    ]
  },
  
  // 规格参数
  specifications: {
    type: Map,
    of: String
  },
  
  // 状态信息
  status: {
    type: String,
    enum: [
      'available',    // 可用
      'in_use',       // 使用中
      'maintaining',  // 维护中
      'repairing',    // 维修中
      'scrapped'      // 已报废
    ],
    default: 'available'
  },
  
  // 位置信息
  location: {
    site: String,     // 站点
    area: String,     // 区域
    position: String  // 具体位置
  },
  
  // 采购信息
  purchase: {
    date: Date,
    price: Number,
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    warranty: {
      start: Date,
      end: Date
    }
  },
  
  // 维护信息
  maintenance: {
    lastDate: Date,
    nextDate: Date,
    cycle: Number,    // 维护周期（天）
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // 使用记录
  usageRecords: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    startTime: Date,
    endTime: Date,
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purpose: String,
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'terminated']
    }
  }],
  
  // 维护记录
  maintenanceRecords: [{
    date: Date,
    type: {
      type: String,
      enum: ['routine', 'repair', 'inspection']
    },
    description: String,
    parts: [{
      name: String,
      quantity: Number,
      cost: Number
    }],
    performer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    result: {
      status: {
        type: String,
        enum: ['passed', 'failed', 'pending']
      },
      notes: String
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  
  // 附件信息
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
equipmentSchema.index({ code: 1 }, { unique: true });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ 'location.site': 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = { Equipment }; 