/**
 * 权限模型
 */
const mongoose = require('mongoose');

// 权限Schema
const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  module: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['menu', 'operation', 'data'],
    default: 'operation'
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 角色Schema
const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  permissions: [{
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission'
    },
    dataScope: {
      type: String,
      enum: ['all', 'department', 'personal', 'custom'],
      default: 'all'
    }
  }],
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 用户角色关联Schema
const UserRoleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
}, {
  timestamps: true
});

// 权限模板Schema
const PermissionTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: String,
  permissions: [{
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true
    },
    dataScope: {
      type: String,
      enum: ['all', 'department', 'personal', 'custom'],
      default: 'all'
    }
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 权限分配记录Schema
const PermissionAssignmentLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 可以是单个用户或多个用户
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // 操作类型：角色分配、直接权限分配、模板应用等
  operationType: {
    type: String,
    enum: ['role_assign', 'direct_permission', 'template_apply', 'batch_assign', 'custom_data_rule'],
    required: true
  },
  // 操作前数据
  beforeState: mongoose.Schema.Types.Mixed,
  // 操作后数据
  afterState: mongoose.Schema.Types.Mixed,
  // 操作详情
  details: String,
  // 操作结果
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  // 如果失败，错误信息
  errorMessage: String,
  // IP地址
  ipAddress: String,
  // 用户代理
  userAgent: String
}, {
  timestamps: true
});

// 自定义数据范围规则Schema
const DataScopeRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  permission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
  // 适用模块
  module: {
    type: String,
    required: true
  },
  // 规则类型
  ruleType: {
    type: String,
    enum: ['department', 'user', 'role', 'field', 'condition'],
    required: true
  },
  // 规则内容 - JSON格式的条件
  ruleConditions: mongoose.Schema.Types.Mixed,
  // 应用于用户
  applyTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 创建索引
PermissionSchema.index({ code: 1 }, { unique: true });
PermissionSchema.index({ module: 1 });
PermissionSchema.index({ type: 1 });

RoleSchema.index({ code: 1 }, { unique: true });

UserRoleSchema.index({ user: 1, role: 1 }, { unique: true });

PermissionTemplateSchema.index({ name: 1 }, { unique: true });
PermissionTemplateSchema.index({ isDefault: 1 });

PermissionAssignmentLogSchema.index({ user: 1 });
PermissionAssignmentLogSchema.index({ targetUsers: 1 });
PermissionAssignmentLogSchema.index({ createdAt: 1 });
PermissionAssignmentLogSchema.index({ operationType: 1 });

DataScopeRuleSchema.index({ permission: 1 });
DataScopeRuleSchema.index({ module: 1 });
DataScopeRuleSchema.index({ 'applyTo.user': 1 });

const Permission = mongoose.model('Permission', PermissionSchema);
const Role = mongoose.model('Role', RoleSchema);
const UserRole = mongoose.model('UserRole', UserRoleSchema);
const PermissionTemplate = mongoose.model('PermissionTemplate', PermissionTemplateSchema);
const PermissionAssignmentLog = mongoose.model('PermissionAssignmentLog', PermissionAssignmentLogSchema);
const DataScopeRule = mongoose.model('DataScopeRule', DataScopeRuleSchema);

module.exports = {
  Permission,
  Role,
  UserRole,
  PermissionTemplate,
  PermissionAssignmentLog,
  DataScopeRule
}; 