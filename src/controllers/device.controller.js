/**
 * 设备控制器
 */
const DeviceProvider = require('../providers/device.provider');
const logger = require('../utils/logger');

class DeviceController {
  constructor() {
    this.deviceProvider = new DeviceProvider();
  }

  /**
   * 设备借出
   */
  async borrowDevice(req, res) {
    try {
      const { deviceId } = req.params;
      const { userId, projectId } = req.body;
      
      const result = await this.deviceProvider.borrowDevice(deviceId, userId, projectId);
      
      logger.info(`设备 ${deviceId} 已借出给用户 ${userId}`);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error(`设备借出失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 设备归还
   */
  async returnDevice(req, res) {
    try {
      const { deviceId } = req.params;
      const { condition } = req.body;
      
      const result = await this.deviceProvider.returnDevice(deviceId, condition);
      
      logger.info(`设备 ${deviceId} 已归还`);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error(`设备归还失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 设备维护记录
   */
  async addMaintenanceRecord(req, res) {
    try {
      const { deviceId } = req.params;
      const maintenanceData = req.body;
      
      const result = await this.deviceProvider.addMaintenanceRecord(deviceId, maintenanceData);
      
      logger.info(`设备 ${deviceId} 添加了新的维护记录`);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error(`添加维护记录失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new DeviceController(); 