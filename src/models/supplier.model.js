/**
 * 供应商管理模型
 */
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  // 基本信息
  code: {
    type: String,
    required: [true, '供应商编号是必需的'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '供应商名称是必需的'],
    trim: true
  },
  category: {
    type: String,
    required: [true, '供应商类别是必需的'],
    enum: [
      'material',    // 材料供应商
      'equipment',   // 设备供应商
      'service',     // 服务供应商
      'contractor',  // 分包商
      'other'        // 其他
    ]
  },
  
  // 企业信息
  businessLicense: {
    number: String,      // 营业执照号
    expireDate: Date,    // 有效期
    attachment: {        // 营业执照附件
      name: String,
      url: String
    }
  },
  taxInfo: {
    number: String,      // 税号
    type: String,        // 纳税人类型
    attachment: {        // 税务登记证附件
      name: String,
      url: String
    }
  },
  
  // 联系信息
  contacts: [{
    name: String,        // 联系人姓名
    title: String,       // 职位
    phone: String,       // 电话
    email: String,       // 邮箱
    isMain: Boolean      // 是否主要联系人
  }],
  address: {
    province: String,    // 省份
    city: String,        // 城市
    district: String,    // 区县
    street: String,      // 街道地址
    postcode: String     // 邮编
  },
  
  // 资质信息
  qualifications: [{
    name: String,        // 资质名称
    level: String,       // 资质等级
    number: String,      // 证书编号
    issueDate: Date,    // 发证日期
    expireDate: Date,   // 有效期
    attachment: {        // 资质证书附件
      name: String,
      url: String
    }
  }],
  
  // 银行信息
  bankInfo: {
    accountName: String,  // 开户名
    bankName: String,     // 开户行
    accountNo: String,    // 账号
    attachment: {         // 开户许可证附件
      name: String,
      url: String
    }
  },
  
  // 合作信息
  cooperation: {
    startDate: Date,     // 合作开始日期
    level: {             // 合作等级
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'C'
    },
    status: {            // 合作状态
      type: String,
      enum: ['active', 'suspended', 'terminated'],
      default: 'active'
    }
  },
  
  // 评价记录
  evaluations: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    date: Date,
    quality: Number,     // 质量评分
    delivery: Number,    // 交付评分
    service: Number,     // 服务评分
    price: Number,       // 价格评分
    average: Number,     // 平均分
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: String
  }],
  
  // 交易记录
  transactions: [{
    date: Date,
    type: {
      type: String,
      enum: ['purchase', 'payment', 'return']
    },
    amount: Number,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    document: {
      type: String,      // 单据类型
      number: String     // 单据编号
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // 黑名单信息
  blacklist: {
    isBlacklisted: {
      type: Boolean,
      default: false
    },
    reason: String,
    date: Date,
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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
supplierSchema.index({ code: 1 }, { unique: true });
supplierSchema.index({ name: 1 });
supplierSchema.index({ category: 1 });
supplierSchema.index({ 'cooperation.status': 1 });
supplierSchema.index({ 'blacklist.isBlacklisted': 1 });

// 虚拟字段：平均评分
supplierSchema.virtual('averageScore').get(function() {
  if (!this.evaluations || this.evaluations.length === 0) {
    return 0;
  }
  return this.evaluations.reduce((sum, eval) => sum + eval.average, 0) / this.evaluations.length;
});

// 方法：检查资质是否过期
supplierSchema.methods.hasExpiredQualifications = function() {
  const now = new Date();
  return this.qualifications.some(qual => qual.expireDate && qual.expireDate < now);
};

// 方法：检查营业执照是否过期
supplierSchema.methods.hasExpiredLicense = function() {
  return this.businessLicense.expireDate && this.businessLicense.expireDate < new Date();
};

// 中间件：更新评分时重新计算平均分
supplierSchema.pre('save', function(next) {
  if (this.isModified('evaluations')) {
    const lastEval = this.evaluations[this.evaluations.length - 1];
    if (lastEval) {
      lastEval.average = (lastEval.quality + lastEval.delivery + lastEval.service + lastEval.price) / 4;
    }
  }
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = { Supplier }; 