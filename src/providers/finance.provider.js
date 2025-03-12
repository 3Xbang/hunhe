/**
 * 财务管理服务提供者
 */
const { Transaction } = require('../models/transaction.model');
const { Budget } = require('../models/budget.model');
const { AppError, notFoundError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');

class FinanceProvider {
  /**
   * 创建交易记录
   */
  async createTransaction(transactionData) {
    // 处理文件上传
    if (transactionData.invoice?.file) {
      const result = await uploadToS3(transactionData.invoice.file, 'invoices');
      transactionData.invoice = {
        ...transactionData.invoice,
        file: {
          url: result.url,
          key: result.key
        }
      };
    }

    if (transactionData.contract?.file) {
      const result = await uploadToS3(transactionData.contract.file, 'contracts');
      transactionData.contract = {
        ...transactionData.contract,
        file: {
          url: result.url,
          key: result.key
        }
      };
    }

    const transaction = await Transaction.create(transactionData);
    return transaction;
  }

  /**
   * 获取交易列表
   */
  async getTransactions(query = {}) {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      startDate,
      endDate,
      search,
      sort = '-createdAt'
    } = query;

    // 构建查询条件
    const queryConditions = {};
    if (type) queryConditions.type = type;
    if (status) queryConditions.status = status;
    if (startDate) queryConditions.date = { $gte: new Date(startDate) };
    if (endDate) queryConditions.date = { ...queryConditions.date, $lte: new Date(endDate) };
    if (search) {
      queryConditions.$or = [
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    // 执行查询
    const transactions = await Transaction.find(queryConditions)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvedBy', 'name');

    // 获取总数
    const total = await Transaction.countDocuments(queryConditions);

    return {
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  /**
   * 获取交易详情
   */
  async getTransaction(transactionId) {
    const transaction = await Transaction.findById(transactionId)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvedBy', 'name');

    if (!transaction) {
      throw notFoundError('交易记录不存在');
    }

    return transaction;
  }

  /**
   * 更新交易记录
   */
  async updateTransaction(transactionId, updateData) {
    // 处理文件上传
    if (updateData.invoice?.file) {
      const result = await uploadToS3(updateData.invoice.file, 'invoices');
      updateData.invoice = {
        ...updateData.invoice,
        file: {
          url: result.url,
          key: result.key
        }
      };
    }

    if (updateData.contract?.file) {
      const result = await uploadToS3(updateData.contract.file, 'contracts');
      updateData.contract = {
        ...updateData.contract,
        file: {
          url: result.url,
          key: result.key
        }
      };
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw notFoundError('交易记录不存在');
    }

    return transaction;
  }

  /**
   * 更新交易状态
   */
  async updateTransactionStatus(transactionId, status, userId) {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status,
        statusUpdatedBy: userId,
        statusUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw notFoundError('交易记录不存在');
    }

    return transaction;
  }

  /**
   * 审批交易
   */
  async approveTransaction(transactionId, approvalData) {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: approvalData.approved ? 'approved' : 'rejected',
        approvalComment: approvalData.comment,
        approvedBy: approvalData.approvedBy,
        approvedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw notFoundError('交易记录不存在');
    }

    return transaction;
  }

  /**
   * 创建预算
   */
  async createBudget(budgetData) {
    const budget = await Budget.create(budgetData);
    return budget;
  }

  /**
   * 获取预算列表
   */
  async getBudgets(query = {}) {
    const {
      page = 1,
      limit = 10,
      year,
      month,
      department,
      status,
      sort = '-createdAt'
    } = query;

    // 构建查询条件
    const queryConditions = {};
    if (year) queryConditions.year = year;
    if (month) queryConditions.month = month;
    if (department) queryConditions.department = department;
    if (status) queryConditions.status = status;

    // 执行查询
    const budgets = await Budget.find(queryConditions)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvedBy', 'name');

    // 获取总数
    const total = await Budget.countDocuments(queryConditions);

    return {
      budgets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  /**
   * 获取预算详情
   */
  async getBudget(budgetId) {
    const budget = await Budget.findById(budgetId)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('approvedBy', 'name');

    if (!budget) {
      throw notFoundError('预算不存在');
    }

    return budget;
  }

  /**
   * 更新预算
   */
  async updateBudget(budgetId, updateData) {
    const budget = await Budget.findByIdAndUpdate(
      budgetId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!budget) {
      throw notFoundError('预算不存在');
    }

    return budget;
  }

  /**
   * 审批预算
   */
  async approveBudget(budgetId, approvalData) {
    const budget = await Budget.findByIdAndUpdate(
      budgetId,
      {
        status: approvalData.approved ? 'approved' : 'rejected',
        approvalComment: approvalData.comment,
        approvedBy: approvalData.approvedBy,
        approvedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!budget) {
      throw notFoundError('预算不存在');
    }

    return budget;
  }
}

module.exports = { FinanceProvider }; 