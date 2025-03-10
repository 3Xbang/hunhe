const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { Material } = require('../models/material.model');
const { User } = require('../models/user.model');
const { Supplier } = require('../models/supplier.model');
const { generateToken } = require('../utils/auth');

describe('材料管理模块测试', () => {
  let token;
  let testUser;
  let testSupplier;
  let testMaterial;

  beforeAll(async () => {
    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      role: 'manager'
    });
    
    // 创建测试供应商
    testSupplier = await Supplier.create({
      name: '测试供应商',
      code: 'SUP001',
      contact: '测试联系人',
      phone: '13800138000',
      createdBy: testUser._id
    });
    
    token = generateToken(testUser);
  });

  beforeEach(async () => {
    // 创建测试材料
    testMaterial = await Material.create({
      code: 'MAT001',
      name: '测试材料',
      category: 'steel',
      specification: '规格型号',
      unit: '件',
      stock: {
        quantity: 100,
        minLimit: 50,
        maxLimit: 200
      },
      price: {
        unit: 100
      },
      supplier: testSupplier._id,
      createdBy: testUser._id
    });
  });

  afterEach(async () => {
    // 清理测试数据
    await Material.deleteMany({});
  });

  afterAll(async () => {
    // 清理用户和供应商数据
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await mongoose.connection.close();
  });

  describe('创建材料', () => {
    it('应该成功创建材料', async () => {
      const materialData = {
        code: 'MAT002',
        name: '新测试材料',
        category: 'concrete',
        specification: '新规格型号',
        unit: '吨',
        stock: {
          quantity: 50,
          minLimit: 20,
          maxLimit: 100
        },
        price: {
          unit: 200
        },
        supplier: testSupplier._id
      };

      const response = await request(app)
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${token}`)
        .send(materialData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.code).toBe(materialData.code);
    });

    it('创建材料时缺少必填字段应该失败', async () => {
      const materialData = {
        name: '新测试材料'
      };

      const response = await request(app)
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${token}`)
        .send(materialData);

      expect(response.status).toBe(400);
    });
  });

  describe('获取材料列表', () => {
    it('应该成功获取材料列表', async () => {
      const response = await request(app)
        .get('/api/v1/materials')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const response = await request(app)
        .get('/api/v1/materials?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });

    it('应该支持按类别筛选', async () => {
      const response = await request(app)
        .get('/api/v1/materials?category=steel')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every(item => item.category === 'steel')).toBe(true);
    });
  });

  describe('获取单个材料', () => {
    it('应该成功获取材料详情', async () => {
      const response = await request(app)
        .get(`/api/v1/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(testMaterial._id.toString());
    });

    it('获取不存在的材料应该失败', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/materials/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('更新材料', () => {
    it('应该成功更新材料信息', async () => {
      const updateData = {
        name: '更新后的材料名称',
        specification: '更新后的规格'
      };

      const response = await request(app)
        .patch(`/api/v1/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('材料入库', () => {
    it('应该成功执行入库操作', async () => {
      const inboundData = {
        quantity: 50,
        batchNo: 'BATCH001',
        supplier: testSupplier._id,
        document: 'purchase_order',
        documentNo: 'PO001'
      };

      const response = await request(app)
        .post(`/api/v1/materials/${testMaterial._id}/inbound`)
        .set('Authorization', `Bearer ${token}`)
        .send(inboundData);

      expect(response.status).toBe(200);
      expect(response.body.data.stock.quantity).toBe(testMaterial.stock.quantity + inboundData.quantity);
    });
  });

  describe('材料出库', () => {
    it('应该成功执行出库操作', async () => {
      const outboundData = {
        quantity: 30,
        project: new mongoose.Types.ObjectId(),
        requestedBy: testUser._id,
        document: 'material_request',
        documentNo: 'MR001'
      };

      const response = await request(app)
        .post(`/api/v1/materials/${testMaterial._id}/outbound`)
        .set('Authorization', `Bearer ${token}`)
        .send(outboundData);

      expect(response.status).toBe(200);
      expect(response.body.data.stock.quantity).toBe(testMaterial.stock.quantity - outboundData.quantity);
    });

    it('库存不足时出库应该失败', async () => {
      const outboundData = {
        quantity: 1000,
        project: new mongoose.Types.ObjectId(),
        requestedBy: testUser._id,
        document: 'material_request',
        documentNo: 'MR002'
      };

      const response = await request(app)
        .post(`/api/v1/materials/${testMaterial._id}/outbound`)
        .set('Authorization', `Bearer ${token}`)
        .send(outboundData);

      expect(response.status).toBe(400);
    });
  });

  describe('库存预警', () => {
    it('应该成功获取库存预警列表', async () => {
      // 先创建一个库存不足的材料
      await Material.create({
        code: 'MAT003',
        name: '库存不足材料',
        category: 'steel',
        specification: '规格型号',
        unit: '件',
        stock: {
          quantity: 10,
          minLimit: 50,
          maxLimit: 200
        },
        price: {
          unit: 100
        },
        supplier: testSupplier._id,
        createdBy: testUser._id
      });

      const response = await request(app)
        .get('/api/v1/materials/stats/low-stock')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.some(item => item.status === 'low_stock')).toBe(true);
    });
  });

  describe('材料统计', () => {
    it('应该成功获取材料统计信息', async () => {
      const response = await request(app)
        .get('/api/v1/materials/stats/overview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.byCategory).toBeDefined();
    });
  });
}); 