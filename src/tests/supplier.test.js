const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Supplier } = require('../models/supplier.model');
const { User } = require('../models/user.model');
const { Project } = require('../models/project.model');
const { generateToken } = require('../utils/auth');
const path = require('path');

describe('供应商管理模块测试', () => {
  let token;
  let adminToken;
  let testUser;
  let adminUser;
  let testProject;
  let testSupplier;

  beforeAll(async () => {
    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      role: 'manager'
    });

    adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      role: 'admin'
    });
    
    // 创建测试项目
    testProject = await Project.create({
      name: '测试项目',
      code: 'PRJ001',
      type: 'construction',
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: testUser._id
    });
    
    token = generateToken(testUser);
    adminToken = generateToken(adminUser);
  });

  beforeEach(async () => {
    // 创建测试供应商
    testSupplier = await Supplier.create({
      code: 'SUP001',
      name: '测试供应商',
      category: 'material',
      businessLicense: {
        number: 'BL123456789',
        expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      contacts: [{
        name: '测试联系人',
        phone: '13800138000',
        email: 'contact@example.com',
        isMain: true
      }],
      address: {
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        street: '科技园路1号'
      },
      bankInfo: {
        accountName: '测试供应商',
        bankName: '测试银行',
        accountNo: '6222021234567890123'
      },
      cooperation: {
        startDate: new Date(),
        level: 'C',
        status: 'active'
      },
      createdBy: testUser._id
    });
  });

  afterEach(async () => {
    await Supplier.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await mongoose.connection.close();
  });

  describe('创建供应商', () => {
    it('应该成功创建供应商', async () => {
      const supplierData = {
        code: 'SUP002',
        name: '新测试供应商',
        category: 'equipment',
        businessLicense: {
          number: 'BL987654321',
          expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        contacts: [{
          name: '新联系人',
          phone: '13900139000',
          email: 'newcontact@example.com',
          isMain: true
        }],
        address: {
          province: '广东省',
          city: '广州市',
          district: '天河区',
          street: '天河路1号'
        },
        bankInfo: {
          accountName: '新测试供应商',
          bankName: '工商银行',
          accountNo: '6222021234567890124'
        },
        cooperation: {
          startDate: new Date()
        }
      };

      const response = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${token}`)
        .field('code', supplierData.code)
        .field('name', supplierData.name)
        .field('category', supplierData.category)
        .field('businessLicense', JSON.stringify(supplierData.businessLicense))
        .field('contacts', JSON.stringify(supplierData.contacts))
        .field('address', JSON.stringify(supplierData.address))
        .field('bankInfo', JSON.stringify(supplierData.bankInfo))
        .field('cooperation', JSON.stringify(supplierData.cooperation))
        .attach('businessLicense', path.resolve(__dirname, './fixtures/test-file.pdf'));

      expect(response.status).toBe(201);
      expect(response.body.data.code).toBe(supplierData.code);
      expect(response.body.data.name).toBe(supplierData.name);
    });

    it('创建供应商时缺少必填字段应该失败', async () => {
      const response = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '新测试供应商'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('获取供应商列表', () => {
    it('应该成功获取供应商列表', async () => {
      const response = await request(app)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const response = await request(app)
        .get('/api/v1/suppliers?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });

    it('应该支持按类别筛选', async () => {
      const response = await request(app)
        .get('/api/v1/suppliers?category=material')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every(item => item.category === 'material')).toBe(true);
    });
  });

  describe('获取供应商详情', () => {
    it('应该成功获取供应商详情', async () => {
      const response = await request(app)
        .get(`/api/v1/suppliers/${testSupplier._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(testSupplier._id.toString());
    });

    it('获取不存在的供应商应该失败', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/suppliers/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('更新供应商', () => {
    it('应该成功更新供应商信息', async () => {
      const updateData = {
        name: '更新后的供应商名称',
        contacts: [{
          name: '新联系人',
          phone: '13800138001',
          isMain: true
        }]
      };

      const response = await request(app)
        .patch(`/api/v1/suppliers/${testSupplier._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('供应商评价', () => {
    it('应该成功添加供应商评价', async () => {
      const evaluationData = {
        project: testProject._id,
        quality: 4.5,
        delivery: 4.0,
        service: 4.2,
        price: 4.0,
        comments: '服务质量不错'
      };

      const response = await request(app)
        .post(`/api/v1/suppliers/${testSupplier._id}/evaluations`)
        .set('Authorization', `Bearer ${token}`)
        .send(evaluationData);

      expect(response.status).toBe(200);
      expect(response.body.data.evaluations).toHaveLength(1);
      expect(response.body.data.evaluations[0].quality).toBe(evaluationData.quality);
    });
  });

  describe('交易记录', () => {
    it('应该成功记录交易', async () => {
      const transactionData = {
        type: 'purchase',
        amount: 10000,
        project: testProject._id,
        document: {
          type: 'purchase_order',
          number: 'PO001'
        }
      };

      const response = await request(app)
        .post(`/api/v1/suppliers/${testSupplier._id}/transactions`)
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData);

      expect(response.status).toBe(200);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].amount).toBe(transactionData.amount);
    });
  });

  describe('合作状态管理', () => {
    it('应该成功更新合作状态', async () => {
      const response = await request(app)
        .patch(`/api/v1/suppliers/${testSupplier._id}/cooperation`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'suspended' });

      expect(response.status).toBe(200);
      expect(response.body.data.cooperation.status).toBe('suspended');
    });
  });

  describe('黑名单管理', () => {
    it('管理员应该能够将供应商加入黑名单', async () => {
      const response = await request(app)
        .patch(`/api/v1/suppliers/${testSupplier._id}/blacklist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isBlacklisted: true,
          reason: '多次违约'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.blacklist.isBlacklisted).toBe(true);
      expect(response.body.data.cooperation.status).toBe('terminated');
    });

    it('非管理员不能将供应商加入黑名单', async () => {
      const response = await request(app)
        .patch(`/api/v1/suppliers/${testSupplier._id}/blacklist`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          isBlacklisted: true,
          reason: '多次违约'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('统计信息', () => {
    it('应该成功获取供应商统计信息', async () => {
      const response = await request(app)
        .get('/api/v1/suppliers/stats/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.byCategory).toBeDefined();
      expect(response.body.data.byLevel).toBeDefined();
    });
  });
}); 