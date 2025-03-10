/**
 * 材料管理服务提供者
 */
const { Material } = require('../models/material.model');
const { uploadFile } = require('../utils/fileUpload');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

class MaterialProvider {
  /**
   * 创建材料
   */
  async createMaterial(materialData) {
    try {
      // 处理附件上传
      if (materialData.attachments) {
        const uploadedFiles = await Promise.all(
          materialData.attachments.map(file => uploadFile(file))
        );
        materialData.attachments = uploadedFiles;
      }
      
      const material = await Material.create(materialData);
      return material;
    } catch (error) {
      logger.error('创建材料失败:', error);
      throw new ApiError(500, '创建材料失败');
    }
  }

  /**
   * 获取材料列表
   */
  async getMaterials(query) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        status,
        search,
        supplier,
        minStock,
        maxStock
      } = query;

      // 构建查询条件
      const conditions = {};
      if (category) conditions.category = category;
      if (status) conditions.status = status;
      if (supplier) conditions.supplier = supplier;
      if (minStock) conditions['stock.quantity'] = { $gte: minStock };
      if (maxStock) conditions['stock.quantity'] = { ...conditions['stock.quantity'], $lte: maxStock };
      if (search) {
        conditions.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { specification: { $regex: search, $options: 'i' } }
        ];
      }

      // 执行查询
      const materials = await Material.find(conditions)
        .populate('supplier', 'name')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // 获取总数
      const total = await Material.countDocuments(conditions);

      return {
        data: materials,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取材料列表失败:', error);
      throw new ApiError(500, '获取材料列表失败');
    }
  }

  /**
   * 获取单个材料
   */
  async getMaterial(materialId) {
    try {
      const material = await Material.findById(materialId)
        .populate('supplier', 'name')
        .populate('createdBy', 'username')
        .populate('inboundRecords.supplier', 'name')
        .populate('inboundRecords.operator', 'username')
        .populate('outboundRecords.project', 'name')
        .populate('outboundRecords.requestedBy', 'username')
        .populate('outboundRecords.approvedBy', 'username')
        .populate('outboundRecords.operator', 'username');

      if (!material) {
        throw new ApiError(404, '材料不存在');
      }

      return material;
    } catch (error) {
      logger.error('获取材料详情失败:', error);
      throw new ApiError(500, '获取材料详情失败');
    }
  }

  /**
   * 更新材料信息
   */
  async updateMaterial(materialId, updateData) {
    try {
      // 处理附件上传
      if (updateData.attachments) {
        const uploadedFiles = await Promise.all(
          updateData.attachments.map(file => uploadFile(file))
        );
        updateData.attachments = uploadedFiles;
      }

      const material = await Material.findByIdAndUpdate(
        materialId,
        updateData,
        { new: true }
      );

      if (!material) {
        throw new ApiError(404, '材料不存在');
      }

      return material;
    } catch (error) {
      logger.error('更新材料信息失败:', error);
      throw new ApiError(500, '更新材料信息失败');
    }
  }

  /**
   * 入库操作
   */
  async inboundMaterial(materialId, inboundData) {
    try {
      const material = await Material.findById(materialId);
      if (!material) {
        throw new ApiError(404, '材料不存在');
      }

      // 处理附件上传
      if (inboundData.attachments) {
        const uploadedFiles = await Promise.all(
          inboundData.attachments.map(file => uploadFile(file))
        );
        inboundData.attachments = uploadedFiles;
      }

      // 更新库存
      material.stock.quantity += inboundData.quantity;
      
      // 添加入库记录
      material.inboundRecords.push(inboundData);
      
      await material.save();
      return material;
    } catch (error) {
      logger.error('材料入库失败:', error);
      throw new ApiError(500, '材料入库失败');
    }
  }

  /**
   * 出库操作
   */
  async outboundMaterial(materialId, outboundData) {
    try {
      const material = await Material.findById(materialId);
      if (!material) {
        throw new ApiError(404, '材料不存在');
      }

      // 检查库存是否足够
      if (material.stock.quantity < outboundData.quantity) {
        throw new ApiError(400, '库存不足');
      }

      // 更新库存
      material.stock.quantity -= outboundData.quantity;
      
      // 添加出库记录
      material.outboundRecords.push(outboundData);
      
      await material.save();
      return material;
    } catch (error) {
      logger.error('材料出库失败:', error);
      throw new ApiError(500, '材料出库失败');
    }
  }

  /**
   * 获取库存预警列表
   */
  async getLowStockMaterials() {
    try {
      const materials = await Material.find({
        $or: [
          { status: 'low_stock' },
          { status: 'out_stock' }
        ]
      })
        .populate('supplier', 'name')
        .sort({ 'stock.quantity': 1 });

      return materials;
    } catch (error) {
      logger.error('获取库存预警列表失败:', error);
      throw new ApiError(500, '获取库存预警列表失败');
    }
  }

  /**
   * 获取材料统计信息
   */
  async getMaterialStats() {
    try {
      const stats = await Material.aggregate([
        {
          $group: {
            _id: null,
            totalTypes: { $sum: 1 },
            totalValue: { 
              $sum: { 
                $multiply: ['$stock.quantity', '$price.unit'] 
              }
            },
            lowStockCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0]
              }
            },
            outStockCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'out_stock'] }, 1, 0]
              }
            }
          }
        }
      ]);

      // 按类别统计
      const categoryStats = await Material.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: {
              $sum: {
                $multiply: ['$stock.quantity', '$price.unit']
              }
            }
          }
        }
      ]);

      return {
        overview: stats[0] || {
          totalTypes: 0,
          totalValue: 0,
          lowStockCount: 0,
          outStockCount: 0
        },
        byCategory: categoryStats
      };
    } catch (error) {
      logger.error('获取材料统计信息失败:', error);
      throw new ApiError(500, '获取材料统计信息失败');
    }
  }
}

module.exports = new MaterialProvider(); 