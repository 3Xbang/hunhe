/**
 * 供应商管理服务提供者
 */
const { Supplier } = require('../models/supplier.model');
const { uploadFile } = require('../utils/fileUpload');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

class SupplierProvider {
  /**
   * 创建供应商
   */
  async createSupplier(supplierData) {
    try {
      // 处理附件上传
      if (supplierData.businessLicense?.attachment) {
        supplierData.businessLicense.attachment = await uploadFile(
          supplierData.businessLicense.attachment
        );
      }
      
      if (supplierData.taxInfo?.attachment) {
        supplierData.taxInfo.attachment = await uploadFile(
          supplierData.taxInfo.attachment
        );
      }
      
      if (supplierData.bankInfo?.attachment) {
        supplierData.bankInfo.attachment = await uploadFile(
          supplierData.bankInfo.attachment
        );
      }
      
      // 处理资质证书附件
      if (supplierData.qualifications) {
        for (let qual of supplierData.qualifications) {
          if (qual.attachment) {
            qual.attachment = await uploadFile(qual.attachment);
          }
        }
      }
      
      // 处理其他附件
      if (supplierData.attachments) {
        supplierData.attachments = await Promise.all(
          supplierData.attachments.map(file => uploadFile(file))
        );
      }
      
      const supplier = await Supplier.create(supplierData);
      return supplier;
    } catch (error) {
      logger.error('创建供应商失败:', error);
      throw new ApiError(500, '创建供应商失败');
    }
  }

  /**
   * 获取供应商列表
   */
  async getSuppliers(query) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        status,
        search,
        cooperationLevel,
        isBlacklisted,
        hasExpiredDocs
      } = query;

      // 构建查询条件
      const conditions = {};
      if (category) conditions.category = category;
      if (status) conditions['cooperation.status'] = status;
      if (cooperationLevel) conditions['cooperation.level'] = cooperationLevel;
      if (isBlacklisted !== undefined) conditions['blacklist.isBlacklisted'] = isBlacklisted;
      if (search) {
        conditions.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { 'contacts.name': { $regex: search, $options: 'i' } }
        ];
      }

      // 处理过期文档筛选
      if (hasExpiredDocs) {
        const now = new Date();
        conditions.$or = [
          { 'businessLicense.expireDate': { $lt: now } },
          { 'qualifications.expireDate': { $lt: now } }
        ];
      }

      // 执行查询
      const suppliers = await Supplier.find(conditions)
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // 获取总数
      const total = await Supplier.countDocuments(conditions);

      return {
        data: suppliers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取供应商列表失败:', error);
      throw new ApiError(500, '获取供应商列表失败');
    }
  }

  /**
   * 获取单个供应商
   */
  async getSupplier(supplierId) {
    try {
      const supplier = await Supplier.findById(supplierId)
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username')
        .populate('evaluations.project', 'name code')
        .populate('evaluations.evaluator', 'username')
        .populate('transactions.project', 'name code')
        .populate('transactions.operator', 'username')
        .populate('blacklist.operator', 'username');

      if (!supplier) {
        throw new ApiError(404, '供应商不存在');
      }

      return supplier;
    } catch (error) {
      logger.error('获取供应商详情失败:', error);
      throw new ApiError(500, '获取供应商详情失败');
    }
  }

  /**
   * 更新供应商信息
   */
  async updateSupplier(supplierId, updateData) {
    try {
      // 处理附件上传
      if (updateData.businessLicense?.attachment) {
        updateData.businessLicense.attachment = await uploadFile(
          updateData.businessLicense.attachment
        );
      }
      
      if (updateData.taxInfo?.attachment) {
        updateData.taxInfo.attachment = await uploadFile(
          updateData.taxInfo.attachment
        );
      }
      
      if (updateData.bankInfo?.attachment) {
        updateData.bankInfo.attachment = await uploadFile(
          updateData.bankInfo.attachment
        );
      }
      
      // 处理资质证书附件
      if (updateData.qualifications) {
        for (let qual of updateData.qualifications) {
          if (qual.attachment) {
            qual.attachment = await uploadFile(qual.attachment);
          }
        }
      }
      
      // 处理其他附件
      if (updateData.attachments) {
        updateData.attachments = await Promise.all(
          updateData.attachments.map(file => uploadFile(file))
        );
      }

      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        updateData,
        { new: true }
      );

      if (!supplier) {
        throw new ApiError(404, '供应商不存在');
      }

      return supplier;
    } catch (error) {
      logger.error('更新供应商信息失败:', error);
      throw new ApiError(500, '更新供应商信息失败');
    }
  }

  /**
   * 添加供应商评价
   */
  async addEvaluation(supplierId, evaluationData) {
    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        throw new ApiError(404, '供应商不存在');
      }

      supplier.evaluations.push({
        ...evaluationData,
        date: new Date()
      });

      await supplier.save();
      return supplier;
    } catch (error) {
      logger.error('添加供应商评价失败:', error);
      throw new ApiError(500, '添加供应商评价失败');
    }
  }

  /**
   * 记录交易
   */
  async recordTransaction(supplierId, transactionData) {
    try {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        throw new ApiError(404, '供应商不存在');
      }

      supplier.transactions.push({
        ...transactionData,
        date: new Date()
      });

      await supplier.save();
      return supplier;
    } catch (error) {
      logger.error('记录交易失败:', error);
      throw new ApiError(500, '记录交易失败');
    }
  }

  /**
   * 更新合作状态
   */
  async updateCooperationStatus(supplierId, { status, updatedBy }) {
    try {
      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        {
          'cooperation.status': status,
          updatedBy
        },
        { new: true }
      );

      if (!supplier) {
        throw new ApiError(404, '供应商不存在');
      }

      return supplier;
    } catch (error) {
      logger.error('更新合作状态失败:', error);
      throw new ApiError(500, '更新合作状态失败');
    }
  }

  /**
   * 加入/移出黑名单
   */
  async updateBlacklist(supplierId, { isBlacklisted, reason, operator }) {
    try {
      const updateData = {
        'blacklist.isBlacklisted': isBlacklisted,
        'blacklist.reason': reason,
        'blacklist.operator': operator,
        'blacklist.date': new Date(),
        'cooperation.status': isBlacklisted ? 'terminated' : 'active'
      };

      const supplier = await Supplier.findByIdAndUpdate(
        supplierId,
        updateData,
        { new: true }
      );

      if (!supplier) {
        throw new ApiError(404, '供应商不存在');
      }

      return supplier;
    } catch (error) {
      logger.error('更新黑名单状态失败:', error);
      throw new ApiError(500, '更新黑名单状态失败');
    }
  }

  /**
   * 获取供应商统计信息
   */
  async getSupplierStats() {
    try {
      const stats = await Supplier.aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            categoryCount: {
              $push: {
                category: '$category',
                status: '$cooperation.status'
              }
            },
            blacklistedCount: {
              $sum: { $cond: ['$blacklist.isBlacklisted', 1, 0] }
            }
          }
        }
      ]);

      // 按类别统计
      const categoryStats = await Supplier.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            activeCount: {
              $sum: {
                $cond: [{ $eq: ['$cooperation.status', 'active'] }, 1, 0]
              }
            }
          }
        }
      ]);

      // 按合作等级统计
      const levelStats = await Supplier.aggregate([
        {
          $group: {
            _id: '$cooperation.level',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        overview: stats[0] || {
          totalCount: 0,
          blacklistedCount: 0
        },
        byCategory: categoryStats,
        byLevel: levelStats
      };
    } catch (error) {
      logger.error('获取供应商统计信息失败:', error);
      throw new ApiError(500, '获取供应商统计信息失败');
    }
  }

  /**
   * 获取过期文档的供应商
   */
  async getExpiredDocSuppliers() {
    try {
      const now = new Date();
      const suppliers = await Supplier.find({
        $or: [
          { 'businessLicense.expireDate': { $lt: now } },
          { 'qualifications.expireDate': { $lt: now } }
        ]
      })
        .select('code name businessLicense qualifications')
        .sort({ 'businessLicense.expireDate': 1 });

      return suppliers;
    } catch (error) {
      logger.error('获取过期文档供应商列表失败:', error);
      throw new ApiError(500, '获取过期文档供应商列表失败');
    }
  }
}

module.exports = new SupplierProvider(); 