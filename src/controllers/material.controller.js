/**
 * 材料控制器
 */
const MaterialProvider = require('../providers/material.provider');
const logger = require('../utils/logger');

class MaterialController {
  constructor() {
    this.materialProvider = new MaterialProvider();
  }

  /**
   * 材料入库
   */
  async materialEntry(req, res) {
    try {
      const entryData = {
        ...req.body,
        requestedBy: req.user.id
      };
      
      const result = await this.materialProvider.processMaterialEntry(entryData);
      
      logger.info(`材料入库成功: ${result.batchNumber}`);
      
      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error(`材料入库失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 材料出库
   */
  async materialIssue(req, res) {
    try {
      const issueData = {
        ...req.body,
        requestedBy: req.user.id
      };
      
      const result = await this.materialProvider.processMaterialIssue(issueData);
      
      logger.info(`材料出库成功: ${result.transactionId}`);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error(`材料出库失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 库存查询
   */
  async checkStock(req, res) {
    try {
      const { materialId } = req.params;
      
      const stock = await this.materialProvider.getStockDetails(materialId);
      
      res.status(200).json({
        status: 'success',
        data: stock
      });
    } catch (error) {
      logger.error(`库存查询失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 批次追踪
   */
  async batchTracking(req, res) {
    try {
      const { batchNumber } = req.params;
      
      const tracking = await this.materialProvider.trackBatch(batchNumber);
      
      res.status(200).json({
        status: 'success',
        data: tracking
      });
    } catch (error) {
      logger.error(`批次追踪失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new MaterialController(); 