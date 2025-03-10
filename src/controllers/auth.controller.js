/**
 * 认证控制器
 */
const jwt = require('jsonwebtoken');
const { AuthProvider } = require('../providers/auth.provider');
const logger = require('../utils/logger');

class AuthController {
  constructor() {
    this.authProvider = new AuthProvider();
  }

  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const { user, token } = await this.authProvider.login(username, password);
      
      logger.info(`用户 ${username} 登录成功`);
      
      res.status(200).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      logger.error(`登录失败: ${error.message}`);
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await this.authProvider.register(userData);
      
      logger.info(`新用户注册成功: ${userData.username}`);
      
      res.status(201).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      logger.error(`注册失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController(); 