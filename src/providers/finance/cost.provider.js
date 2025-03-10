/**
 * 成本管理服务提供者
 */
const { Cost } = require('../../models/finance/cost.model');
const { Budget } = require('../../models/finance/budget.model');
const { generateCode } = require('../../utils/codeGenerator');
const { ApiError } = require('../../utils/apiError');
const { uploadFile } = require('../../utils/fileUploader');

class CostProvider {
  /**
   * 记录成本
   */
  async createCost(costData, files) {
    // 生成成本编号
    const code = await generateCode('CST');
    
    // 如果关联了预算项目，需要检查预算
    if (costData.budgetItem) {
      const budget = await Budget.findById(costData.budgetItem);
      if (!budget) {
        throw new ApiError(404, '预算项目不存在');
      }
      
      // 检查预算状态和金额
      if (budget.status !== 'approved') {
        throw new ApiError(400, '只能使用已审批的预算');
      }
      if (budget.usedAmount + costData.amount > budget.amount) {
        throw new ApiError(400, '超出预算金额');
      }

      // 更新预算使用金额
      await Budget.findByIdAndUpdate(costData.budgetItem, {
        $inc: { usedAmount: costData.amount }
      });
    }

    // 处理附件上传
    let attachments = [];
    if (files && files.length > 0) {
      attachments = await Promise.all(
        files.map(file => uploadFile(file, 'costs'))
      );
    }

    const cost = new Cost({
      ...costData,
      code,
      attachments
    });

    await cost.save();
    return cost;
  }

  /**
   * 获取成本列表
   */
  async getCosts(query) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      startDate,
      endDate,
      search
    } = query;

    const conditions = {};
    if (project) conditions.project = project;
    if (type) conditions.type = type;
    if (startDate || endDate) {
      conditions.date = {};
      if (startDate) conditions.date.$gte = new Date(startDate);
      if (endDate) conditions.date.$lte = new Date(endDate);
    }
    if (search) {
      conditions.$or = [
        { code: new RegExp(search, 'i') },
        { item: new RegExp(search, 'i') }
      ];
    }

    const [costs, total] = await Promise.all([
      Cost.find(conditions)
        .populate('project', 'name code')
        .populate('supplier', 'name code')
        .populate('budgetItem', 'name code')
        .populate('createdBy', 'username')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Cost.countDocuments(conditions)
    ]);

    return {
      data: costs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取成本详情
   */
  async getCost(id) {
    const cost = await Cost.findById(id)
      .populate('project', 'name code')
      .populate('supplier', 'name code')
      .populate('budgetItem', 'name code')
      .populate('createdBy', 'username');

    if (!cost) {
      throw new ApiError(404, '成本记录不存在');
    }

    return cost;
  }

  /**
   * 更新成本记录
   */
  async updateCost(id, updateData, files) {
    const cost = await Cost.findById(id);
    if (!cost) {
      throw new ApiError(404, '成本记录不存在');
    }

    // 如果修改金额且关联了预算，需要重新计算预算使用情况
    if (updateData.amount && cost.budgetItem) {
      const budget = await Budget.findById(cost.budgetItem);
      if (!budget) {
        throw new ApiError(404, '预算项目不存在');
      }

      const amountDiff = updateData.amount - cost.amount;
      if (budget.usedAmount + amountDiff > budget.amount) {
        throw new ApiError(400, '超出预算金额');
      }

      // 更新预算使用金额
      await Budget.findByIdAndUpdate(cost.budgetItem, {
        $inc: { usedAmount: amountDiff }
      });
    }

    // 处理新上传的附件
    if (files && files.length > 0) {
      const newAttachments = await Promise.all(
        files.map(file => uploadFile(file, 'costs'))
      );
      updateData.attachments = [...(cost.attachments || []), ...newAttachments];
    }

    Object.assign(cost, updateData);
    await cost.save();
    return cost;
  }

  /**
   * 删除成本记录
   */
  async deleteCost(id) {
    const cost = await Cost.findById(id);
    if (!cost) {
      throw new ApiError(404, '成本记录不存在');
    }

    // 如果关联了预算，需要更新预算使用金额
    if (cost.budgetItem) {
      await Budget.findByIdAndUpdate(cost.budgetItem, {
        $inc: { usedAmount: -cost.amount }
      });
    }

    await cost.remove();
    return { success: true };
  }

  /**
   * 获取成本统计
   */
  async getCostStats(projectId) {
    const stats = await Cost.aggregate([
      {
        $match: projectId ? { project: projectId } : {}
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 计算各类型成本占比
    const total = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    stats.forEach(stat => {
      stat.percentage = ((stat.totalAmount / total) * 100).toFixed(2);
    });

    return stats;
  }

  /**
   * 获取成本趋势
   */
  async getCostTrend(query) {
    const { project, type, period = 'month', startDate, endDate } = query;

    const conditions = {};
    if (project) conditions.project = project;
    if (type) conditions.type = type;
    if (startDate || endDate) {
      conditions.date = {};
      if (startDate) conditions.date.$gte = new Date(startDate);
      if (endDate) conditions.date.$lte = new Date(endDate);
    }

    const groupBy = {};
    if (period === 'day') {
      groupBy._id = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
    } else if (period === 'month') {
      groupBy._id = { $dateToString: { format: '%Y-%m', date: '$date' } };
    } else if (period === 'year') {
      groupBy._id = { $dateToString: { format: '%Y', date: '$date' } };
    }

    const trend = await Cost.aggregate([
      { $match: conditions },
      {
        $group: {
          ...groupBy,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return trend;
  }
}

module.exports = new CostProvider(); 