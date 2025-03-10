/**
 * 付款管理服务提供者
 */
const { Payment } = require('../../models/finance/payment.model');
const { Invoice } = require('../../models/finance/invoice.model');
const { Supplier } = require('../../models/supplier.model');
const { generateCode } = require('../../utils/codeGenerator');
const { ApiError } = require('../../utils/apiError');
const { uploadFile } = require('../../utils/fileUploader');

class PaymentProvider {
  /**
   * 创建付款申请
   */
  async createPayment(paymentData, files) {
    // 生成付款编号
    const code = await generateCode('PAY');
    
    // 验证供应商
    const supplier = await Supplier.findById(paymentData.payee);
    if (!supplier) {
      throw new ApiError(404, '供应商不存在');
    }

    // 检查供应商状态
    if (supplier.blacklist?.isBlacklisted) {
      throw new ApiError(400, '该供应商已被列入黑名单');
    }

    // 验证关联发票
    if (paymentData.invoices && paymentData.invoices.length > 0) {
      const invoices = await Invoice.find({
        _id: { $in: paymentData.invoices },
        supplier: paymentData.payee
      });

      if (invoices.length !== paymentData.invoices.length) {
        throw new ApiError(400, '部分发票不存在或不属于该供应商');
      }

      // 检查发票状态
      const invalidInvoices = invoices.filter(inv => inv.status !== 'verified');
      if (invalidInvoices.length > 0) {
        throw new ApiError(400, '存在未验证的发票');
      }

      // 验证付款金额不超过发票总额
      const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      if (paymentData.amount > totalInvoiceAmount) {
        throw new ApiError(400, '付款金额不能超过发票总额');
      }
    }

    // 处理附件上传
    let attachments = [];
    if (files && files.length > 0) {
      attachments = await Promise.all(
        files.map(file => uploadFile(file, 'payments'))
      );
    }

    const payment = new Payment({
      ...paymentData,
      code,
      attachments,
      status: 'pending'
    });

    await payment.save();
    return payment;
  }

  /**
   * 获取付款列表
   */
  async getPayments(query) {
    const {
      page = 1,
      limit = 10,
      project,
      payee,
      type,
      status,
      startDate,
      endDate,
      search
    } = query;

    const conditions = {};
    if (project) conditions.project = project;
    if (payee) conditions.payee = payee;
    if (type) conditions.type = type;
    if (status) conditions.status = status;
    if (startDate || endDate) {
      conditions.plannedDate = {};
      if (startDate) conditions.plannedDate.$gte = new Date(startDate);
      if (endDate) conditions.plannedDate.$lte = new Date(endDate);
    }
    if (search) {
      conditions.$or = [
        { code: new RegExp(search, 'i') },
        { remarks: new RegExp(search, 'i') }
      ];
    }

    const [payments, total] = await Promise.all([
      Payment.find(conditions)
        .populate('project', 'name code')
        .populate('payee', 'name code')
        .populate('invoices')
        .populate('createdBy', 'username')
        .populate('approvals.approver', 'username')
        .sort({ plannedDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Payment.countDocuments(conditions)
    ]);

    return {
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取付款详情
   */
  async getPayment(id) {
    const payment = await Payment.findById(id)
      .populate('project', 'name code')
      .populate('payee', 'name code')
      .populate('invoices')
      .populate('createdBy', 'username')
      .populate('approvals.approver', 'username');

    if (!payment) {
      throw new ApiError(404, '付款记录不存在');
    }

    return payment;
  }

  /**
   * 更新付款申请
   */
  async updatePayment(id, updateData, files) {
    const payment = await Payment.findById(id);
    if (!payment) {
      throw new ApiError(404, '付款记录不存在');
    }

    // 检查付款状态
    if (payment.status !== 'pending') {
      throw new ApiError(400, '只能修改待审批状态的付款申请');
    }

    // 如果更新了发票，需要重新验证
    if (updateData.invoices) {
      const invoices = await Invoice.find({
        _id: { $in: updateData.invoices },
        supplier: payment.payee
      });

      if (invoices.length !== updateData.invoices.length) {
        throw new ApiError(400, '部分发票不存在或不属于该供应商');
      }

      const invalidInvoices = invoices.filter(inv => inv.status !== 'verified');
      if (invalidInvoices.length > 0) {
        throw new ApiError(400, '存在未验证的发票');
      }

      const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      if ((updateData.amount || payment.amount) > totalInvoiceAmount) {
        throw new ApiError(400, '付款金额不能超过发票总额');
      }
    }

    // 处理新上传的附件
    if (files && files.length > 0) {
      const newAttachments = await Promise.all(
        files.map(file => uploadFile(file, 'payments'))
      );
      updateData.attachments = [...(payment.attachments || []), ...newAttachments];
    }

    Object.assign(payment, updateData);
    await payment.save();
    return payment;
  }

  /**
   * 审批付款申请
   */
  async approvePayment(id, approvalData) {
    const payment = await Payment.findById(id);
    if (!payment) {
      throw new ApiError(404, '付款记录不存在');
    }

    if (payment.status !== 'pending') {
      throw new ApiError(400, '只能审批待审核状态的付款申请');
    }

    payment.approvals.push({
      approver: approvalData.approver,
      status: approvalData.status,
      comments: approvalData.comments,
      date: new Date()
    });

    payment.status = approvalData.status === 'approved' ? 'approved' : 'rejected';
    await payment.save();
    return payment;
  }

  /**
   * 确认付款完成
   */
  async confirmPayment(id, confirmData) {
    const payment = await Payment.findById(id);
    if (!payment) {
      throw new ApiError(404, '付款记录不存在');
    }

    if (payment.status !== 'approved') {
      throw new ApiError(400, '只能确认已审批的付款申请');
    }

    payment.status = 'paid';
    payment.actualDate = new Date();
    payment.updatedBy = confirmData.operator;

    // 更新关联发票状态
    if (payment.invoices && payment.invoices.length > 0) {
      await Invoice.updateMany(
        { _id: { $in: payment.invoices } },
        { status: 'reimbursed' }
      );
    }

    await payment.save();
    return payment;
  }

  /**
   * 获取付款统计
   */
  async getPaymentStats(query) {
    const { project, startDate, endDate } = query;
    
    const conditions = { status: 'paid' };
    if (project) conditions.project = project;
    if (startDate || endDate) {
      conditions.actualDate = {};
      if (startDate) conditions.actualDate.$gte = new Date(startDate);
      if (endDate) conditions.actualDate.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
      { $match: conditions },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 计算各类型付款占比
    const total = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    stats.forEach(stat => {
      stat.percentage = ((stat.totalAmount / total) * 100).toFixed(2);
    });

    return stats;
  }

  /**
   * 获取付款计划
   */
  async getPaymentPlan(query) {
    const { startDate, endDate, status = ['pending', 'approved'] } = query;

    const conditions = {
      status: { $in: status },
      plannedDate: {}
    };
    if (startDate) conditions.plannedDate.$gte = new Date(startDate);
    if (endDate) conditions.plannedDate.$lte = new Date(endDate);

    const payments = await Payment.find(conditions)
      .populate('project', 'name code')
      .populate('payee', 'name code')
      .select('code amount plannedDate status type')
      .sort({ plannedDate: 1 });

    // 按日期分组
    const plan = {};
    payments.forEach(payment => {
      const dateKey = payment.plannedDate.toISOString().split('T')[0];
      if (!plan[dateKey]) {
        plan[dateKey] = {
          date: dateKey,
          totalAmount: 0,
          payments: []
        };
      }
      plan[dateKey].totalAmount += payment.amount;
      plan[dateKey].payments.push(payment);
    });

    return Object.values(plan);
  }
}

module.exports = new PaymentProvider(); 