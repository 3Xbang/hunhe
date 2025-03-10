/**
 * 文档管理模型
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  // 文档编号
  code: {
    type: String,
    required: true,
    unique: true
  },

  // 文档标题
  title: {
    type: String,
    required: true,
    trim: true
  },

  // 文档类型
  type: {
    type: String,
    required: true,
    enum: [
      'contract',        // 合同文档
      'drawing',         // 图纸
      'specification',   // 规范说明
      'report',          // 报告
      'minutes',         // 会议纪要
      'approval',        // 审批文件
      'other'           // 其他
    ]
  },

  // 所属项目
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  // 文档描述
  description: {
    type: String,
    trim: true
  },

  // 文档版本
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },

  // 文档状态
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },

  // 文档标签
  tags: [{
    type: String,
    trim: true
  }],

  // 文件信息
  files: [{
    filename: String,    // 文件名
    originalname: String,// 原始文件名
    path: String,       // 存储路径
    size: Number,       // 文件大小
    mimetype: String,   // 文件类型
    uploadedAt: Date    // 上传时间
  }],

  // 访问权限
  accessLevel: {
    type: String,
    required: true,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'internal'
  },

  // 授权用户
  authorizedUsers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'share']
    }]
  }],

  // 审批记录
  approvals: [{
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['submit', 'approve', 'reject', 'archive']
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // 版本历史
  versions: [{
    version: String,
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changes: String,
    files: [{
      filename: String,
      originalname: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadedAt: Date
    }],
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // 元数据
  metadata: {
    author: String,              // 作者
    department: String,          // 部门
    documentDate: Date,          // 文档日期
    expiryDate: Date,           // 过期日期
    keywords: [String],         // 关键词
    language: String,           // 语言
    reviewDate: Date,           // 审查日期
    customFields: Schema.Types.Mixed // 自定义字段
  },

  // 创建和更新信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
documentSchema.index({ code: 1 });
documentSchema.index({ project: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ 'metadata.keywords': 1 });
documentSchema.index({ createdAt: -1 });

// 中间件
documentSchema.pre('save', async function(next) {
  if (this.isNew) {
    // 生成文档编号
    const counter = await mongoose.model('Counter').findOneAndUpdate(
      { type: 'document' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.code = `DOC${counter.seq.toString().padStart(6, '0')}`;
  }
  next();
});

// 方法
documentSchema.methods = {
  /**
   * 检查用户权限
   */
  hasPermission(userId, permission) {
    const userAuth = this.authorizedUsers.find(auth => 
      auth.user.toString() === userId.toString()
    );
    return userAuth && userAuth.permissions.includes(permission);
  },

  /**
   * 添加新版本
   */
  async addVersion(versionData) {
    this.version = versionData.version;
    this.versions.push(versionData);
    return this.save();
  },

  /**
   * 更新文档状态
   */
  async updateStatus(status, operator, comments) {
    this.status = status;
    this.approvals.push({
      operator,
      action: status,
      comments,
      date: new Date()
    });
    return this.save();
  },

  /**
   * 检查文档是否过期
   */
  isExpired() {
    return this.metadata.expiryDate && 
           this.metadata.expiryDate < new Date();
  }
};

// 静态方法
documentSchema.statics = {
  /**
   * 获取用户可访问的文档
   */
  async getAccessibleDocuments(userId, query = {}) {
    return this.find({
      $or: [
        { accessLevel: 'public' },
        { accessLevel: 'internal' },
        {
          accessLevel: { $in: ['confidential', 'restricted'] },
          'authorizedUsers.user': userId
        }
      ],
      ...query
    });
  },

  /**
   * 搜索文档
   */
  async searchDocuments(keyword, filters = {}) {
    const searchConditions = {
      $or: [
        { title: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
        { tags: new RegExp(keyword, 'i') },
        { 'metadata.keywords': new RegExp(keyword, 'i') }
      ],
      ...filters
    };
    return this.find(searchConditions);
  }
};

const Document = mongoose.model('Document', documentSchema);
module.exports = Document; 