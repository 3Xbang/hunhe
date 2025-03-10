/**
 * 认证服务提供者
 */
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { AppError } = require('../utils/appError');

class AuthProvider {
  /**
   * 用户登录
   */
  async login(username, password) {
    // 查找用户
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT token
    const token = this.generateToken(user._id);

    return { user, token };
  }

  /**
   * 用户注册
   */
  async register(userData) {
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      throw new AppError('用户名或邮箱已存在', 400);
    }

    // 创建新用户
    const user = await User.create(userData);
    return user;
  }

  /**
   * 生成 JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = { AuthProvider }; 