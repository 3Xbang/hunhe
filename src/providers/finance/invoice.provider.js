/**
 * 发票管理服务提供者
 */
const { Invoice } = require('../../models/finance/invoice.model');
const { Supplier } = require('../../models/supplier.model');
const { generateCode } = require('../../utils/codeGenerator');
const { ApiError } = require('../../utils/apiError');
const { uploadFile } = require('../../utils/fileUploader');
const { validateInvoice } = require('../../utils/invoiceValidator');

class InvoiceProvider {
  /**
   * 登记发票
   */
  async createInvoice(invoiceData, files) {
    // 生成发票编号
    const code = await generateCode('INV');
    
    // 验证供应商
    const supplier = await Supplier.findById(invoiceData.supplier);
    if (!supplier) {
      throw new ApiError(404, '供应商不存在');
    }

    // 检查供应商状态
    if (supplier.blacklist?.isBlacklisted) {
      throw new ApiError(400, '该供应商已被列入黑名单');
    }

    // 检查发票号是否重复
    const existingInvoice = await Invoice.findOne({
      number: invoiceData.number,
      supplier: invoiceData.supplier
    });
    if (existingInvoice) {
      throw new ApiError(400, '该供应商的发票号已存在');
    }

    // 计算税额和总额
    const taxAmount = invoiceData.amount * (invoiceData.taxRate / 100);
    const totalAmount = invoiceData.amount + taxAmount;

    // 处理发票图片上传
    let images = [];
    if (files && files.length > 0) {
      images = await Promise.all(
        files.map(file => uploadFile(file, 'invoices'))
      );
    }

    const invoice = new Invoice({
      ...invoiceData,
      code,
      taxAmount,
      totalAmount,
      images,
      status: 'pending'
    });

    await invoice.save();
    return invoice;
  }

  /**
   * 获取发票列表
   */
  async getInvoices(query) {
    const {
      page = 1,
      limit = 10,
      project,
      supplier,
      type,
      status,
      startDate,
      endDate,
      search
    } = query;

    const conditions = {};
    if (project) conditions.project = project;
    if (supplier) conditions.supplier = supplier;
    if (type) conditions.type = type;
    if (status) conditions.status = status;
    if (startDate || endDate) {
      conditions.issueDate = {};
      if (startDate) conditions.issueDate.$gte = new Date(startDate);
      if (endDate) conditions.issueDate.$lte = new Date(endDate);
    }
    if (search) {
      conditions.$or = [
        { code: new RegExp(search, 'i') },
        { number: new RegExp(search, 'i') }
      ];
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(conditions)
        .populate('project', 'name code')
        .populate('supplier', 'name code')
        .populate('createdBy', 'username')
        .sort({ issueDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Invoice.countDocuments(conditions)
    ]);

    return {
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取发票详情
   */
  async getInvoice(id) {
    const invoice = await Invoice.findById(id)
      .populate('project', 'name code')
      .populate('supplier', 'name code')
      .populate('createdBy', 'username');

    if (!invoice) {
      throw new ApiError(404, '发票不存在');
    }

    return invoice;
  }

  /**
   * 更新发票信息
   */
  async updateInvoice(id, updateData, files) {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw new ApiError(404, '发票不存在');
    }

    // 检查发票状态
    if (invoice.status !== 'pending') {
      throw new ApiError(400, '只能修改待验证状态的发票');
    }

    // 如果更新了金额或税率，重新计算
    if (updateData.amount || updateData.taxRate) {
      const amount = updateData.amount || invoice.amount;
      const taxRate = updateData.taxRate || invoice.taxRate;
      updateData.taxAmount = amount * (taxRate / 100);
      updateData.totalAmount = amount + updateData.taxAmount;
    }

    // 处理新上传的图片
    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map(file => uploadFile(file, 'invoices'))
      );
      updateData.images = [...(invoice.images || []), ...newImages];
    }

    Object.assign(invoice, updateData);
    await invoice.save();
    return invoice;
  }

  /**
   * 验证发票
   */
  async verifyInvoice(id, verifyData) {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw new ApiError(404, '发票不存在');
    }

    if (invoice.status !== 'pending') {
      throw new ApiError(400, '发票已经验证过');
    }

    // 调用发票验证服务
    try {
      const validationResult = await validateInvoice({
        number: invoice.number,
        amount: invoice.amount,
        taxRate: invoice.taxRate,
        issueDate: invoice.issueDate,
        supplier: invoice.supplier
      });

      if (!validationResult.valid) {
        throw new ApiError(400, `发票验证失败: ${validationResult.message}`);
      }

      invoice.status = 'verified';
      invoice.updatedBy = verifyData.operator;
      await invoice.save();
      
      return invoice;
    } catch (error) {
      throw new ApiError(400, `发票验证失败: ${error.message}`);
    }
  }

  /**
   * 作废发票
   */
  async cancelInvoice(id, cancelData) {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw new ApiError(404, '发票不存在');
    }

    if (invoice.status === 'reimbursed') {
      throw new ApiError(400, '已报销的发票不能作废');
    }

    if (invoice.status === 'cancelled') {
      throw new ApiError(400, '发票已作废');
    }

    invoice.status = 'cancelled';
    invoice.remarks = `${invoice.remarks || ''}\n作废原因: ${cancelData.reason}`;
    invoice.updatedBy = cancelData.operator;
    await invoice.save();

    return invoice;
  }

  /**
   * 获取发票统计
   */
  async getInvoiceStats(query) {
    const { project, supplier, startDate, endDate } = query;
    
    const conditions = { status: { $in: ['verified', 'reimbursed'] } };
    if (project) conditions.project = project;
    if (supplier) conditions.supplier = supplier;
    if (startDate || endDate) {
      conditions.issueDate = {};
      if (startDate) conditions.issueDate.$gte = new Date(startDate);
      if (endDate) conditions.issueDate.$lte = new Date(endDate);
    }

    const stats = await Invoice.aggregate([
      { $match: conditions },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$totalAmount' },
          totalTaxAmount: { $sum: '$taxAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 计算各类型发票占比
    const total = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    stats.forEach(stat => {
      stat.percentage = ((stat.totalAmount / total) * 100).toFixed(2);
    });

    return stats;
  }

  /**
   * 获取待验证发票
   */
  async getPendingInvoices(query) {
    const { supplier, days = 7 } = query;

    const conditions = {
      status: 'pending',
      issueDate: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };
    if (supplier) conditions.supplier = supplier;

    const invoices = await Invoice.find(conditions)
      .populate('project', 'name code')
      .populate('supplier', 'name code')
      .sort({ issueDate: 1 });

    return invoices;
  }

  /**
   * 获取发票汇总报表
   */
  async getInvoiceSummary(query) {
    const { startDate, endDate, groupBy = 'month' } = query;

    const conditions = {
      status: { $in: ['verified', 'reimbursed'] }
    };
    if (startDate || endDate) {
      conditions.issueDate = {};
      if (startDate) conditions.issueDate.$gte = new Date(startDate);
      if (endDate) conditions.issueDate.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }

    const summary = await Invoice.aggregate([
      { $match: conditions },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$issueDate' } },
            type: '$type'
          },
          totalAmount: { $sum: '$totalAmount' },
          totalTaxAmount: { $sum: '$taxAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.type': 1 } }
    ]);

    // 重组数据结构
    const report = {};
    summary.forEach(item => {
      const { date, type } = item._id;
      if (!report[date]) {
        report[date] = {
          date,
          total: 0,
          totalTax: 0,
          types: {}
        };
      }
      report[date].total += item.totalAmount;
      report[date].totalTax += item.totalTaxAmount;
      report[date].types[type] = {
        amount: item.totalAmount,
        taxAmount: item.totalTaxAmount,
        count: item.count
      };
    });

    return Object.values(report);
  }
}

module.exports = new InvoiceProvider(); 