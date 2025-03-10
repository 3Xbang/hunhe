/**
 * 设备服务提供者
 */
const Device = require('../models/device.model');
const { AppError } = require('../utils/appError');

class DeviceProvider {
  /**
   * 设备借出
   */
  async borrowDevice(deviceId, userId, projectId) {
    const device = await Device.findById(deviceId);
    
    if (!device) {
      throw new AppError('设备不存在', 404);
    }
    
    if (device.status !== 'available') {
      throw new AppError('设备当前不可借用', 400);
    }
    
    device.status = 'in_use';
    device.currentUser = userId;
    device.project = projectId;
    
    return await device.save();
  }

  /**
   * 设备归还
   */
  async returnDevice(deviceId, condition) {
    const device = await Device.findById(deviceId);
    
    if (!device) {
      throw new AppError('设备不存在', 404);
    }
    
    if (device.status !== 'in_use') {
      throw new AppError('设备状态错误', 400);
    }
    
    device.status = 'available';
    device.currentUser = null;
    device.project = null;
    
    // 如果设备状况需要维护
    if (condition === 'needs_maintenance') {
      device.status = 'maintenance';
      device.nextMaintenanceDate = new Date();
    }
    
    return await device.save();
  }

  /**
   * 添加维护记录
   */
  async addMaintenanceRecord(deviceId, maintenanceData) {
    const device = await Device.findById(deviceId);
    
    if (!device) {
      throw new AppError('设备不存在', 404);
    }
    
    device.maintenanceHistory.push({
      date: new Date(),
      ...maintenanceData
    });
    
    device.lastMaintenance = new Date();
    device.nextMaintenanceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天后
    device.status = 'available';
    
    return await device.save();
  }
}

module.exports = DeviceProvider; 