/**
 * 材料管理模型
 */
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  // 基本信息
  code: {
    type: String,
    required: [true, '材料编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '材料名称是必需的'],
    trim: true
  },
  category: {
    type: String,
    required: [true, '材料类别是必需的'],
    enum: [
      'steel',          // 钢材
      'concrete',       // 混凝土
      'wood',          // 木材
      'brick',         // 砖石
      'paint',         // 涂料
      'electrical',    // 电气材料
      'plumbing',      // 管道材料
      'other'          // 其他
    ]
  },
  
  // 规格信息
  specification: {
    type: String,
    required: [true, '规格型号是必需的'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, '计量单位是必需的'],
    trim: true
  },
  
  // 库存信息
  stock: {
    quantity: {
      type: Number,
      required: [true, '库存数量是必需的'],
      min: 0
    },
    minLimit: {
      type: Number,
      required: [true, '最小库存限制是必需的'],
      min: 0
    },
    maxLimit: {
      type: Number,
      required: [true, '最大库存限制是必需的'],
      min: 0
    },
    location: {
      warehouse: String,  // 仓库
      area: String,      // 区域
      shelf: String      // 货架
    }
  },
  
  // 价格信息
  price: {
    unit: {
      type: Number,
      required: [true, '单价是必需的'],
      min: 0
    },
    currency: {
      type: String,
      default: 'CNY'
    }
  },
  
  // 供应商信息
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, '供应商信息是必需的']
  },
  
  // 质量信息
  quality: {
    grade: String,
    certification: String,
    expiryDate: Date,
    manufacturer: String
  },
  
  // 入库记录
  inboundRecords: [{
    date: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    batchNo: String,
    price: Number,
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    document: {
      type: String,
      enum: ['purchase_order', 'return_order', 'transfer_order']
    },
    documentNo: String,
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  
  // 出库记录
  outboundRecords: [{
    date: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    document: {
      type: String,
      enum: ['material_request', 'return_order', 'transfer_order']
    },
    documentNo: String,
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // 状态
  status: {
    type: String,
    enum: [
      'active',      // 正常
      'low_stock',   // 库存不足
      'out_stock',   // 缺货
      'discontinued' // 停用
    ],
    default: 'active'
  },
  
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
materialSchema.index({ code: 1 }, { unique: true });
materialSchema.index({ category: 1 });
materialSchema.index({ status: 1 });
materialSchema.index({ 'stock.quantity': 1 });
materialSchema.index({ supplier: 1 });

// 虚拟字段：库存价值
materialSchema.virtual('stockValue').get(function() {
  return this.stock.quantity * this.price.unit;
});

// 方法：检查库存是否不足
materialSchema.methods.isLowStock = function() {
  return this.stock.quantity <= this.stock.minLimit;
};

// 方法：检查库存是否超出
materialSchema.methods.isOverStock = function() {
  return this.stock.quantity >= this.stock.maxLimit;
};

// 中间件：更新状态
materialSchema.pre('save', function(next) {
  if (this.stock.quantity === 0) {
    this.status = 'out_stock';
  } else if (this.stock.quantity <= this.stock.minLimit) {
    this.status = 'low_stock';
  } else {
    this.status = 'active';
  }
  next();
});

const Material = mongoose.model('Material', materialSchema);

module.exports = { Material }; 