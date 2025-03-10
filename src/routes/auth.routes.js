/**
 * 认证路由
 */
const express = require('express');
const { validateRegister, validateLogin } = require('../middlewares/validators/auth.validator');
const { AuthProvider } = require('../providers/auth.provider');
const { AppError } = require('../utils/appError');

const router = express.Router();
const authProvider = new AuthProvider();

/**
 * @route POST /api/v1/auth/register
 * @desc 用户注册
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const user = await authProvider.register(req.body);
    res.status(201).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/auth/login
 * @desc 用户登录
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await authProvider.login(username, password);
    
    res.status(200).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 