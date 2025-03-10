/**
 * 财务管理服务提供者
 */
const { Transaction, Budget } = require('../models/finance.model');
const { AppError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');

class FinanceProvider {
  /**
   * 创建交易记录
   */
  async createTransaction(transactionData) {
    // 上传发票
    if (transactionData.invoice?.file) {
      const result = await uploadToS3(transactionData.invoice.file);
      transactionData.invoice.url = result.Location;
      delete transactionData.invoice.file;
    }

    // 上传合同
    if (transactionData.contract?.file) {
      const result = await uploadToS3(transactionData.contract.file);
      transactionData.contract.url = result.Location;
      delete transactionData.contract.file;
    }

    const transaction = await Transaction.create(transactionData);
    await this.updateBudgetActuals(transaction);
    return transaction;
  }

  /**
   * 获取交易记录
   */
  async getTransaction(transactionId) {
    const transaction = await Transaction.findById(transactionId)
      .populate('project', 'name code')
      .populate('supplier', 'name code')
      .populate('equipment', 'name code')
      .populate('approvedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!transaction) {
      throw new AppError('交易记录不存在', 404);
    }

    return transaction;
  }

  /**
   * 获取交易列表
   */
  async getTransactions(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      category,
      startDate,
      endDate,
      paymentStatus,
      approvalStatus,
      sortBy
    } = query;

    const filter = {};

    // 构建过滤条件
    if (project) filter.project = project;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    // 构建排序
    let sort = { date: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'amount':
          sort = { amount: -1 };
          break;
        case 'paymentStatus':
          sort = { paymentStatus: 1 };
          break;
        case 'approvalStatus':
          sort = { approvalStatus: 1 };
          break;
      }
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('project', 'name code')
      .populate('supplier', 'name code')
      .populate('equipment', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      transactions
    };
  }

  /**
   * 更新交易记录
   */
  async updateTransaction(transactionId, updateData) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new AppError('交易记录不存在', 404);
    }

    // 上传新发票
    if (updateData.invoice?.file) {
      const result = await uploadToS3(updateData.invoice.file);
      updateData.invoice.url = result.Location;
      delete updateData.invoice.file;
    }

    // 上传新合同
    if (updateData.contract?.file) {
      const result = await uploadToS3(updateData.contract.file);
      updateData.contract.url = result.Location;
      delete updateData.contract.file;
    }

    // 如果金额、类型或日期发生变化，需要更新预算
    const needUpdateBudget = 
      updateData.amount !== transaction.amount ||
      updateData.type !== transaction.type ||
      updateData.date?.getMonth() !== transaction.date.getMonth() ||
      updateData.date?.getFullYear() !== transaction.date.getFullYear();

    if (needUpdateBudget) {
      // 先回滚原交易对预算的影响
      await this.updateBudgetActuals(transaction, true);
    }

    Object.assign(transaction, updateData);
    await transaction.save();

    if (needUpdateBudget) {
      // 更新新交易对预算的影响
      await this.updateBudgetActuals(transaction);
    }

    return transaction;
  }

  /**
   * 更新交易状态
   */
  async updateTransactionStatus(transactionId, status, updatedBy) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new AppError('交易记录不存在', 404);
    }

    transaction.paymentStatus = status;
    transaction.updatedBy = updatedBy;
    
    if (status === 'completed') {
      transaction.paymentDate = new Date();
    }

    await transaction.save();
    return transaction;
  }

  /**
   * 审批交易
   */
  async approveTransaction(transactionId, { status, notes, approvedBy }) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new AppError('交易记录不存在', 404);
    }

    transaction.approvalStatus = status;
    transaction.approvalNotes = notes;
    transaction.approvedBy = approvedBy;
    transaction.approvalDate = new Date();

    await transaction.save();
    return transaction;
  }

  /**
   * 创建预算
   */
  async createBudget(budgetData) {
    // 检查是否已存在同期预算
    const existingBudget = await Budget.findOne({
      project: budgetData.project,
      year: budgetData.year,
      month: budgetData.month
    });

    if (existingBudget) {
      throw new AppError('该期间的预算已存在', 400);
    }

    const budget = await Budget.create(budgetData);
    return budget;
  }

  /**
   * 获取预算
   */
  async getBudget(budgetId) {
    const budget = await Budget.findById(budgetId)
      .populate('project', 'name code')
      .populate('approvedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!budget) {
      throw new AppError('预算不存在', 404);
    }

    return budget;
  }

  /**
   * 获取预算列表
   */
  async getBudgets(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      year,
      month,
      status
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (year) filter.year = year;
    if (month) filter.month = month;
    if (status) filter.status = status;

    const total = await Budget.countDocuments(filter);
    const budgets = await Budget.find(filter)
      .populate('project', 'name code')
      .sort({ year: -1, month: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      budgets
    };
  }

  /**
   * 更新预算
   */
  async updateBudget(budgetId, updateData) {
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      throw new AppError('预算不存在', 404);
    }

    Object.assign(budget, updateData);
    await budget.save();
    return budget;
  }

  /**
   * 审批预算
   */
  async approveBudget(budgetId, { status, notes, approvedBy }) {
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      throw new AppError('预算不存在', 404);
    }

    budget.status = status;
    budget.approvalNotes = notes;
    budget.approvedBy = approvedBy;
    budget.approvalDate = new Date();

    await budget.save();
    return budget;
  }

  /**
   * 获取项目财务统计
   */
  async getProjectFinanceStats(projectId, query = {}) {
    const { startDate, endDate } = query;

    const filter = { project: projectId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 收支统计
    const transactionStats = await Transaction.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // 支付状态统计
    const paymentStats = await Transaction.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // 预算执行情况
    const budgetStats = await Budget.aggregate([
      {
        $match: {
          project: projectId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalPlannedIncome: { $sum: '$totalPlannedIncome' },
          totalPlannedExpense: { $sum: '$totalPlannedExpense' },
          totalActualIncome: { $sum: '$totalActualIncome' },
          totalActualExpense: { $sum: '$totalActualExpense' }
        }
      }
    ]);

    return {
      transactionStats,
      paymentStats,
      budgetStats: budgetStats[0] || {
        totalPlannedIncome: 0,
        totalPlannedExpense: 0,
        totalActualIncome: 0,
        totalActualExpense: 0
      }
    };
  }

  /**
   * 更新预算实际金额
   * @private
   */
  async updateBudgetActuals(transaction, isRollback = false) {
    const date = new Date(transaction.date);
    const budget = await Budget.findOne({
      project: transaction.project,
      year: date.getFullYear(),
      month: date.getMonth() + 1
    });

    if (!budget) return;

    const amount = isRollback ? -transaction.amount : transaction.amount;

    if (transaction.type === 'income') {
      budget.totalActualIncome += amount;
    } else {
      budget.totalActualExpense += amount;
    }

    await budget.save();
  }
}

module.exports = { FinanceProvider }; 