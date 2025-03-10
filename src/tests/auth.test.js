/**
 * 认证模块测试用例
 */
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const { connectDB } = require('../config/database');
const mongoose = require('mongoose');

describe('认证模块', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'employee'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).toEqual({
        status: 'success',
        data: {
          user: {
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            status: 'active'
          }
        }
      });
    });

    it('应该拒绝重复的用户名', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        name: 'Test User'
      };

      await User.create(userData);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).toEqual({
        status: 'error',
        message: '用户名或邮箱已存在'
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('应该成功登录并返回token', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        name: 'Test User'
      };

      await User.create(userData);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('username', userData.username);
    });

    it('应该拒绝错误的密码', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        name: 'Test User'
      };

      await User.create(userData);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: userData.username,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).toEqual({
        status: 'error',
        message: '用户名或密码错误'
      });
    });
  });
}); 