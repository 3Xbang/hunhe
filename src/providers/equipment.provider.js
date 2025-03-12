/**
 * 设备管理服务提供者
 */
const { Equipment } = require('../models/equipment.model');
const { uploadToS3, deleteFromS3 } = require('../utils/fileUpload');
const { AppError, notFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

class EquipmentProvider {
  /**
   * 创建设备
   */
  async createEquipment(equipmentData) {
    try {
      // 处理附件上传
      if (equipmentData.attachments) {
        const uploadedFiles = await Promise.all(
          equipmentData.attachments.map(file => uploadToS3(file))
        );
        equipmentData.attachments = uploadedFiles;
      }
      
      const equipment = await Equipment.create(equipmentData);
      return equipment;
    } catch (error) {
      logger.error('创建设备失败:', error);
      throw new AppError(500, '创建设备失败');
    }
  }

  /**
   * 获取设备列表
   */
  async getEquipments(query) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        status,
        search,
        site
      } = query;

      // 构建查询条件
      const conditions = {};
      if (category) conditions.category = category;
      if (status) conditions.status = status;
      if (site) conditions['location.site'] = site;
      if (search) {
        conditions.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } }
        ];
      }

      // 执行查询
      const equipments = await Equipment.find(conditions)
        .populate('createdBy', 'username')
        .populate('maintenance.responsible', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // 获取总数
      const total = await Equipment.countDocuments(conditions);

      return {
        data: equipments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取设备列表失败:', error);
      throw new AppError(500, '获取设备列表失败');
    }
  }

  /**
   * 获取单个设备
   */
  async getEquipment(equipmentId) {
    try {
      const equipment = await Equipment.findById(equipmentId)
        .populate('createdBy', 'username')
        .populate('maintenance.responsible', 'username')
        .populate('usageRecords.operator', 'username')
        .populate('maintenanceRecords.performer', 'username');

      if (!equipment) {
        throw new AppError(404, '设备不存在');
      }

      return equipment;
    } catch (error) {
      logger.error('获取设备详情失败:', error);
      throw new AppError(500, '获取设备详情失败');
    }
  }

  /**
   * 更新设备信息
   */
  async updateEquipment(equipmentId, updateData) {
    try {
      // 处理附件上传
      if (updateData.attachments) {
        const uploadedFiles = await Promise.all(
          updateData.attachments.map(file => uploadToS3(file))
        );
        updateData.attachments = uploadedFiles;
      }

      const equipment = await Equipment.findByIdAndUpdate(
        equipmentId,
        updateData,
        { new: true }
      );

      if (!equipment) {
        throw new AppError(404, '设备不存在');
      }

      return equipment;
    } catch (error) {
      logger.error('更新设备信息失败:', error);
      throw new AppError(500, '更新设备信息失败');
    }
  }

  /**
   * 记录设备使用
   */
  async recordEquipmentUsage(equipmentId, usageData) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        throw new AppError(404, '设备不存在');
      }

      // 检查设备是否可用
      if (equipment.status !== 'available') {
        throw new AppError(400, '设备当前不可用');
      }

      // 添加使用记录
      equipment.usageRecords.push(usageData);
      equipment.status = 'in_use';
      
      await equipment.save();
      return equipment;
    } catch (error) {
      logger.error('记录设备使用失败:', error);
      throw new AppError(500, '记录设备使用失败');
    }
  }

  /**
   * 记录设备维护
   */
  async recordMaintenance(equipmentId, maintenanceData) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        throw new AppError(404, '设备不存在');
      }

      // 处理附件上传
      if (maintenanceData.attachments) {
        const uploadedFiles = await Promise.all(
          maintenanceData.attachments.map(file => uploadToS3(file))
        );
        maintenanceData.attachments = uploadedFiles;
      }

      // 添加维护记录
      equipment.maintenanceRecords.push(maintenanceData);
      equipment.status = 'maintaining';
      equipment.maintenance.lastDate = new Date();
      equipment.maintenance.nextDate = new Date(
        Date.now() + equipment.maintenance.cycle * 24 * 60 * 60 * 1000
      );

      await equipment.save();
      return equipment;
    } catch (error) {
      logger.error('记录设备维护失败:', error);
      throw new AppError(500, '记录设备维护失败');
    }
  }

  /**
   * 更新设备状态
   */
  async updateEquipmentStatus(equipmentId, { status, notes }) {
    try {
      const equipment = await Equipment.findByIdAndUpdate(
        equipmentId,
        { 
          status,
          notes,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!equipment) {
        throw new AppError(404, '设备不存在');
      }

      return equipment;
    } catch (error) {
      logger.error('更新设备状态失败:', error);
      throw new AppError(500, '更新设备状态失败');
    }
  }

  /**
   * 获取设备统计信息
   */
  async getEquipmentStats() {
    try {
      const stats = await Equipment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: {
              $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
            },
            inUse: {
              $sum: { $cond: [{ $eq: ['$status', 'in_use'] }, 1, 0] }
            },
            maintaining: {
              $sum: { $cond: [{ $eq: ['$status', 'maintaining'] }, 1, 0] }
            },
            repairing: {
              $sum: { $cond: [{ $eq: ['$status', 'repairing'] }, 1, 0] }
            },
            scrapped: {
              $sum: { $cond: [{ $eq: ['$status', 'scrapped'] }, 1, 0] }
            }
          }
        }
      ]);

      // 按类别统计
      const categoryStats = await Equipment.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        overview: stats[0] || {
          total: 0,
          available: 0,
          inUse: 0,
          maintaining: 0,
          repairing: 0,
          scrapped: 0
        },
        byCategory: categoryStats
      };
    } catch (error) {
      logger.error('获取设备统计信息失败:', error);
      throw new AppError(500, '获取设备统计信息失败');
    }
  }
}

module.exports = new EquipmentProvider(); 