/**
 * 财务控制器
 */
const FinanceProvider = require('../providers/finance.provider');
const logger = require('../utils/logger');

class FinanceController {
  constructor() {
    this.financeProvider = new FinanceProvider();
  }

  /**
   * 创建交易记录
   */
  async createTransaction(req, res) {
    try {
      const transactionData = req.body;
      transactionData.createdBy = req.user.id;
      
      const transaction = await this.financeProvider.createTransaction(transactionData);
      
      logger.info(`新交易记录已创建: ${transaction.transactionId}`);
      
      res.status(201).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      logger.error(`创建交易记录失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 生成发票
   */
  async generateInvoice(req, res) {
    try {
      const invoiceData = req.body;
      
      const invoice = await this.financeProvider.generateInvoice(invoiceData);
      
      logger.info(`新发票已生成: ${invoice.invoiceNumber}`);
      
      res.status(201).json({
        status: 'success',
        data: { invoice }
      });
    } catch (error) {
      logger.error(`生成发票失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 处理工资发放
   */
  async processSalary(req, res) {
    try {
      const { month, employees } = req.body;
      
      const salaryRecords = await this.financeProvider.processSalary(month, employees);
      
      logger.info(`工资处理完成: ${month}`);
      
      res.status(200).json({
        status: 'success',
        data: { salaryRecords }
      });
    } catch (error) {
      logger.error(`工资处理失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * 生成财务报表
   */
  async generateFinancialReport(req, res) {
    try {
      const { startDate, endDate, type } = req.query;
      
      const report = await this.financeProvider.generateFinancialReport(startDate, endDate, type);
      
      logger.info(`财务报表已生成: ${type}`);
      
      res.status(200).json({
        status: 'success',
        data: { report }
      });
    } catch (error) {
      logger.error(`生成财务报表失败: ${error.message}`);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new FinanceController(); 