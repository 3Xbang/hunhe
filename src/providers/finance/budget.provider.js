/**
 * 预算管理服务提供者
 */
const { Budget } = require('../../models/finance/budget.model');
const { generateCode } = require('../../utils/codeGenerator');
const { ApiError } = require('../../utils/apiError');

class BudgetProvider {
  /**
   * 创建预算
   */
  async createBudget(budgetData) {
    // 生成预算编号
    const code = await generateCode('BUD');
    
    // 计算预算项目总额
    const totalPlannedAmount = budgetData.items.reduce((sum, item) => sum + item.plannedAmount, 0);
    if (totalPlannedAmount !== budgetData.amount) {
      throw new ApiError(400, '预算项目总额与预算金额不符');
    }

    const budget = new Budget({
      ...budgetData,
      code,
      usedAmount: 0
    });

    await budget.save();
    return budget;
  }

  /**
   * 获取预算列表
   */
  async getBudgets(query) {
    const {
      page = 1,
      limit = 10,
      project,
      year,
      type,
      status,
      search
    } = query;

    const conditions = {};
    if (project) conditions.project = project;
    if (year) conditions.year = year;
    if (type) conditions.type = type;
    if (status) conditions.status = status;
    if (search) {
      conditions.$or = [
        { code: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') }
      ];
    }

    const [budgets, total] = await Promise.all([
      Budget.find(conditions)
        .populate('project', 'name code')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Budget.countDocuments(conditions)
    ]);

    return {
      data: budgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取预算详情
   */
  async getBudget(id) {
    const budget = await Budget.findById(id)
      .populate('project', 'name code')
      .populate('createdBy', 'username')
      .populate('approvals.approver', 'username');

    if (!budget) {
      throw new ApiError(404, '预算不存在');
    }

    return budget;
  }

  /**
   * 更新预算
   */
  async updateBudget(id, updateData) {
    const budget = await Budget.findById(id);
    if (!budget) {
      throw new ApiError(404, '预算不存在');
    }

    // 检查预算状态
    if (budget.status !== 'draft') {
      throw new ApiError(400, '只能修改草稿状态的预算');
    }

    // 如果更新预算项目，需要验证总额
    if (updateData.items) {
      const totalPlannedAmount = updateData.items.reduce((sum, item) => sum + item.plannedAmount, 0);
      if (totalPlannedAmount !== (updateData.amount || budget.amount)) {
        throw new ApiError(400, '预算项目总额与预算金额不符');
      }
    }

    Object.assign(budget, updateData);
    await budget.save();
    return budget;
  }

  /**
   * 提交预算审批
   */
  async submitBudget(id) {
    const budget = await Budget.findById(id);
    if (!budget) {
      throw new ApiError(404, '预算不存在');
    }

    if (budget.status !== 'draft') {
      throw new ApiError(400, '只能提交草稿状态的预算');
    }

    budget.status = 'pending';
    await budget.save();
    return budget;
  }

  /**
   * 审批预算
   */
  async approveBudget(id, approvalData) {
    const budget = await Budget.findById(id);
    if (!budget) {
      throw new ApiError(404, '预算不存在');
    }

    if (budget.status !== 'pending') {
      throw new ApiError(400, '只能审批待审核状态的预算');
    }

    budget.approvals.push({
      approver: approvalData.approver,
      status: approvalData.status,
      comments: approvalData.comments
    });

    budget.status = approvalData.status === 'approved' ? 'approved' : 'rejected';
    await budget.save();
    return budget;
  }

  /**
   * 更新预算使用金额
   */
  async updateBudgetUsage(id, amount) {
    const budget = await Budget.findById(id);
    if (!budget) {
      throw new ApiError(404, '预算不存在');
    }

    if (budget.status !== 'approved') {
      throw new ApiError(400, '只能使用已审批的预算');
    }

    if (budget.usedAmount + amount > budget.amount) {
      throw new ApiError(400, '超出预算金额');
    }

    budget.usedAmount += amount;
    await budget.save();
    return budget;
  }

  /**
   * 获取预算统计信息
   */
  async getBudgetStats(projectId) {
    const stats = await Budget.aggregate([
      {
        $match: {
          project: projectId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          usedAmount: { $sum: '$usedAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return stats;
  }

  /**
   * 获取预算执行报表
   */
  async getBudgetReport(query) {
    const {
      project,
      year,
      type
    } = query;

    const conditions = { status: 'approved' };
    if (project) conditions.project = project;
    if (year) conditions.year = year;
    if (type) conditions.type = type;

    const budgets = await Budget.find(conditions)
      .populate('project', 'name code')
      .select('code name amount usedAmount items');

    const report = {
      summary: {
        totalBudget: 0,
        totalUsed: 0,
        totalRemaining: 0
      },
      details: budgets.map(budget => ({
        code: budget.code,
        name: budget.name,
        project: budget.project,
        amount: budget.amount,
        usedAmount: budget.usedAmount,
        remainingAmount: budget.remainingAmount,
        usageRate: budget.usageRate,
        items: budget.items
      }))
    };

    // 计算总计
    report.summary.totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    report.summary.totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);
    report.summary.totalRemaining = report.summary.totalBudget - report.summary.totalUsed;

    return report;
  }
}

module.exports = new BudgetProvider(); 