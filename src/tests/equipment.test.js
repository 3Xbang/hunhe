const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Equipment } = require('../models/equipment.model');
const { User } = require('../models/user.model');
const { generateToken } = require('../utils/auth');

describe('设备管理模块测试', () => {
  let token;
  let testUser;
  let testEquipment;

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
    // 创建测试设备
    testEquipment = await Equipment.create({
      code: 'TEST001',
      name: '测试设备',
      model: 'TEST-M1',
      category: 'machinery',
      status: 'available',
      createdBy: testUser._id
    });
  });

  afterEach(async () => {
    // 清理测试数据
    await Equipment.deleteMany({});
  });

  afterAll(async () => {
    // 清理用户数据并关闭数据库连接
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('设备基础功能测试', () => {
    test('创建设备 - 成功', async () => {
      const response = await request(app)
        .post('/api/v1/equipments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'NEW001',
          name: '新设备',
          model: 'NEW-M1',
          category: 'electrical'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('code', 'NEW001');
    });

    test('获取设备列表 - 成功', async () => {
      const response = await request(app)
        .get('/api/v1/equipments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    test('获取单个设备 - 成功', async () => {
      const response = await request(app)
        .get(`/api/v1/equipments/${testEquipment._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(testEquipment._id.toString());
    });

    test('更新设备 - 成功', async () => {
      const response = await request(app)
        .patch(`/api/v1/equipments/${testEquipment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '更新后的设备名称'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('更新后的设备名称');
    });
  });

  describe('设备使用记录测试', () => {
    test('记录设备使用 - 成功', async () => {
      const response = await request(app)
        .post(`/api/v1/equipments/${testEquipment._id}/usage`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          project: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          purpose: '测试使用'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('in_use');
    });
  });

  describe('设备维护记录测试', () => {
    test('记录设备维护 - 成功', async () => {
      const response = await request(app)
        .post(`/api/v1/equipments/${testEquipment._id}/maintenance`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'routine',
          description: '例行维护',
          performer: testUser._id
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('maintaining');
    });
  });

  describe('设备统计测试', () => {
    test('获取设备统计信息 - 成功', async () => {
      const response = await request(app)
        .get('/api/v1/equipments/stats/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data.byCategory).toBeInstanceOf(Array);
    });
  });
}); 