/**
 * 项目管理模块测试
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Project } = require('../models/project.model');
const { User } = require('../models/user.model');
const { generateToken } = require('../utils/auth');

describe('项目管理模块测试', () => {
  let token;
  let testUser;
  let testProject;

  beforeAll(async () => {
    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      role: 'manager'
    });
    
    token = generateToken(testUser);
  });

  beforeEach(async () => {
    // 创建测试项目
    testProject = await Project.create({
      name: '测试项目',
      code: 'TEST001',
      type: 'development',
      status: 'planning',
      manager: testUser._id,
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: testUser._id
    });
  });

  afterEach(async () => {
    // 清理测试数据
    await Project.deleteMany({});
  });

  afterAll(async () => {
    // 清理用户数据并关闭数据库连接
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('项目基础功能测试', () => {
    test('创建项目 - 成功', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '新项目',
          code: 'NEW001',
          type: 'development',
          plannedStartDate: new Date(),
          plannedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('name', '新项目');
    });

    test('获取项目列表 - 成功', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    test('获取单个项目 - 成功', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(testProject._id.toString());
    });

    test('更新项目 - 成功', async () => {
      const response = await request(app)
        .patch(`/api/v1/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '更新后的项目名称'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('更新后的项目名称');
    });
  });

  describe('项目里程碑测试', () => {
    test('创建里程碑 - 成功', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProject._id}/milestones`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '测试里程碑',
          plannedDate: new Date(),
          weight: 20
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('name', '测试里程碑');
    });
  });

  describe('项目风险测试', () => {
    test('创建风险 - 成功', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProject._id}/risks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '测试风险',
          type: 'technical',
          probability: 'medium',
          impact: 'moderate'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('title', '测试风险');
    });
  });

  describe('项目资源分配测试', () => {
    test('分配资源 - 成功', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProject._id}/resources`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          resourceType: 'human',
          resourceId: testUser._id,
          quantity: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('resourceType', 'human');
    });
  });

  describe('项目成本测试', () => {
    test('记录成本 - 成功', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProject._id}/costs`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'labor',
          amount: 1000,
          date: new Date(),
          description: '人工成本'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('amount', 1000);
    });
  });
}); 