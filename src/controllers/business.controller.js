/**
 * 业务控制器
 */
const BusinessProvider = require('../providers/business.provider');
const logger = require('../utils/logger');

class BusinessController {
  constructor() {
    this.businessProvider = new BusinessProvider();
  }

  /**
   * 考勤打卡
   */
  async checkIn(req, res) {
    try {
      const checkInData = {
        ...req.body,
        employee: req.user.id
      };
      
      const attendance = await this.businessProvider.processCheckIn(checkInData);
      
      logger.info(`员工打卡成功: ${req.user.id}`);
      
      res.status(200).json({
        status: 'success',
        data: { attendance }
      });
    } catch (error) {
      logger.error(`打卡失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 创建任务
   */
  async createTask(req, res) {
    try {
      const taskData = {
        ...req.body,
        assignedBy: req.user.id
      };
      
      const task = await this.businessProvider.createTask(taskData);
      
      logger.info(`新任务创建成功: ${task._id}`);
      
      res.status(201).json({
        status: 'success',
        data: { task }
      });
    } catch (error) {
      logger.error(`任务创建失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 获取客户看板
   */
  async getClientDashboard(req, res) {
    try {
      const clientId = req.user.id;
      
      const dashboard = await this.businessProvider.getClientDashboard(clientId);
      
      res.status(200).json({
        status: 'success',
        data: { dashboard }
      });
    } catch (error) {
      logger.error(`获取客户看板失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 创建采购订单
   */
  async createPurchaseOrder(req, res) {
    try {
      const purchaseData = {
        ...req.body,
        requestedBy: req.user.id
      };
      
      const purchase = await this.businessProvider.createPurchaseOrder(purchaseData);
      
      logger.info(`新采购订单创建成功: ${purchase.purchaseCode}`);
      
      res.status(201).json({
        status: 'success',
        data: { purchase }
      });
    } catch (error) {
      logger.error(`采购订单创建失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new BusinessController(); 