/**
 * 用户模型
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * 用户架构
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '用户名是必填项'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少3个字符'],
      maxlength: [20, '用户名最多20个字符']
    },
    password: {
      type: String,
      required: [true, '密码是必填项'],
      minlength: [8, '密码至少8个字符'],
      select: false // 默认不返回密码
    },
    name: {
      type: String,
      required: [true, '姓名是必填项']
    },
    email: {
      type: String,
      required: [true, '邮箱是必填项'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        '请提供有效的邮箱地址'
      ]
    },
    mobile: {
      type: String,
      match: [/^1[3-9]\d{9}$/, '请提供有效的手机号码']
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user', 'finance', 'hr', 'procurement'],
      default: 'user'
    },
    department: {
      type: String,
      enum: ['管理', '技术', '财务', '人事', '采购', '质检', '安全', '其他'],
      default: '其他'
    },
    position: {
      type: String
    },
    permissions: {
      type: [String],
      select: false // 默认不返回权限列表
    },
    avatar: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'blocked'],
      default: 'active'
    },
    lastLogin: Date,
    invalidatedTokens: [String], // 失效的令牌列表
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true // 自动添加 createdAt 和 updatedAt 字段
  }
);

/**
 * 保存前加密密码
 */
userSchema.pre('save', async function (next) {
  // 如果密码没有修改，则不需要重新加密
  if (!this.isModified('password')) return next();

  // 加密密码
  this.password = await bcrypt.hash(this.password, 12);

  // 更新密码修改时间
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

/**
 * 比较密码是否匹配
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * 检查密码是否在指定日期后更改
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = { User }; 