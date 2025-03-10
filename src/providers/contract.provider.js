/**
 * 合同管理服务提供者
 */
const { Contract, Payment, ChangeOrder } = require('../models/contract.model');
const { AppError } = require('../utils/appError');
const { uploadToS3 } = require('../utils/fileUpload');

class ContractProvider {
  /**
   * 创建合同
   */
  async createContract(contractData) {
    // 上传合同文档
    if (contractData.documents) {
      for (let i = 0; i < contractData.documents.length; i++) {
        const document = contractData.documents[i];
        if (document.file) {
          const result = await uploadToS3(document.file);
          contractData.documents[i].url = result.Location;
          delete contractData.documents[i].file;
        }
      }
    }

    const contract = await Contract.create(contractData);
    return contract;
  }

  /**
   * 获取合同
   */
  async getContract(contractId) {
    const contract = await Contract.findById(contractId)
      .populate('project', 'name code')
      .populate('documents.uploadedBy', 'name')
      .populate('approval.approvers.user', 'name')
      .populate('approval.finalApproval.approvedBy', 'name')
      .populate('changes.approvedBy', 'name')
      .populate('changes.documents.uploadedBy', 'name')
      .populate('performance.verifiedBy', 'name')
      .populate('performance.attachments.uploadedBy', 'name')
      .populate('risks.identifiedBy', 'name')
      .populate('risks.resolvedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!contract) {
      throw new AppError('合同不存在', 404);
    }

    return contract;
  }

  /**
   * 获取合同列表
   */
  async getContracts(query = {}) {
    const {
      page = 1,
      limit = 10,
      project,
      type,
      status,
      company,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy
    } = query;

    const filter = {};

    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (company) filter['partyB.company'] = new RegExp(company, 'i');
    if (startDate || endDate) {
      filter['term.startDate'] = {};
      if (startDate) filter['term.startDate'].$gte = new Date(startDate);
      if (endDate) filter['term.startDate'].$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter['amount.value'] = {};
      if (minAmount) filter['amount.value'].$gte = Number(minAmount);
      if (maxAmount) filter['amount.value'].$lte = Number(maxAmount);
    }

    let sort = { 'term.startDate': -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'amount':
          sort = { 'amount.value': -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
        case 'company':
          sort = { 'partyB.company': 1 };
          break;
      }
    }

    const total = await Contract.countDocuments(filter);
    const contracts = await Contract.find(filter)
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      contracts
    };
  }

  /**
   * 更新合同
   */
  async updateContract(contractId, updateData) {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new AppError('合同不存在', 404);
    }

    // 上传新文档
    if (updateData.documents) {
      for (let i = 0; i < updateData.documents.length; i++) {
        const document = updateData.documents[i];
        if (document.file) {
          const result = await uploadToS3(document.file);
          updateData.documents[i].url = result.Location;
          delete updateData.documents[i].file;
        }
      }
    }

    Object.assign(contract, updateData);
    await contract.save();
    return contract;
  }

  /**
   * 审批合同
   */
  async approveContract(contractId, { level, status, comments, approvedBy }) {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new AppError('合同不存在', 404);
    }

    // 更新审批记录
    const approver = {
      user: approvedBy,
      status,
      date: new Date(),
      comments
    };

    if (!contract.approval.approvers) {
      contract.approval.approvers = [];
    }
    contract.approval.approvers.push(approver);

    // 如果是最终审批
    if (level === contract.approval.level) {
      contract.approval.finalApproval = {
        status,
        date: new Date(),
        approvedBy
      };

      // 更新合同状态
      if (status === 'approved') {
        contract.status = 'pending';  // 待签署
      } else if (status === 'rejected') {
        contract.status = 'draft';    // 退回草稿
      }
    }

    await contract.save();
    return contract;
  }

  /**
   * 签署合同
   */
  async signContract(contractId, signingData) {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new AppError('合同不存在', 404);
    }

    contract.signing = signingData;
    contract.status = 'active';  // 更新为执行中状态
    
    await contract.save();
    return contract;
  }

  /**
   * 终止合同
   */
  async terminateContract(contractId, { reason, date, documents = [] }) {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new AppError('合同不存在', 404);
    }

    // 上传终止文档
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      if (document.file) {
        const result = await uploadToS3(document.file);
        documents[i].url = result.Location;
        delete documents[i].file;
      }
    }

    // 添加终止记录
    contract.changes.push({
      type: 'termination',
      description: reason,
      date,
      status: 'approved',
      documents
    });

    contract.status = 'terminated';
    await contract.save();
    return contract;
  }

  /**
   * 创建付款记录
   */
  async createPayment(paymentData) {
    // 上传发票和支付凭证
    if (paymentData.invoice?.attachment?.file) {
      const result = await uploadToS3(paymentData.invoice.attachment.file);
      paymentData.invoice.attachment.url = result.Location;
      delete paymentData.invoice.attachment.file;
    }

    if (paymentData.payment?.proof?.file) {
      const result = await uploadToS3(paymentData.payment.proof.file);
      paymentData.payment.proof.url = result.Location;
      delete paymentData.payment.proof.file;
    }

    const payment = await Payment.create(paymentData);
    return payment;
  }

  /**
   * 获取付款记录
   */
  async getPayment(paymentId) {
    const payment = await Payment.findById(paymentId)
      .populate('contract', 'code name')
      .populate('conditions.documents.verifiedBy', 'name')
      .populate('invoice.attachment.uploadedBy', 'name')
      .populate('payment.proof.uploadedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!payment) {
      throw new AppError('付款记录不存在', 404);
    }

    return payment;
  }

  /**
   * 获取付款记录列表
   */
  async getPayments(query = {}) {
    const {
      page = 1,
      limit = 10,
      contract,
      type,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy
    } = query;

    const filter = {};

    if (contract) filter.contract = contract;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.plannedDate = {};
      if (startDate) filter.plannedDate.$gte = new Date(startDate);
      if (endDate) filter.plannedDate.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter['amount.planned'] = {};
      if (minAmount) filter['amount.planned'].$gte = Number(minAmount);
      if (maxAmount) filter['amount.planned'].$lte = Number(maxAmount);
    }

    let sort = { plannedDate: 1 };
    if (sortBy) {
      switch (sortBy) {
        case 'amount':
          sort = { 'amount.planned': -1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('contract', 'code name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      payments
    };
  }

  /**
   * 更新付款记录
   */
  async updatePayment(paymentId, updateData) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('付款记录不存在', 404);
    }

    // 上传新文件
    if (updateData.invoice?.attachment?.file) {
      const result = await uploadToS3(updateData.invoice.attachment.file);
      updateData.invoice.attachment.url = result.Location;
      delete updateData.invoice.attachment.file;
    }

    if (updateData.payment?.proof?.file) {
      const result = await uploadToS3(updateData.payment.proof.file);
      updateData.payment.proof.url = result.Location;
      delete updateData.payment.proof.file;
    }

    Object.assign(payment, updateData);
    await payment.save();
    return payment;
  }

  /**
   * 审批付款
   */
  async approvePayment(paymentId, { status, comments, approvedBy }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('付款记录不存在', 404);
    }

    payment.approval = {
      status,
      approvedBy,
      approvedAt: new Date(),
      comments
    };

    if (status === 'approved') {
      payment.status = 'processing';
    } else if (status === 'rejected') {
      payment.status = 'planned';
    }

    await payment.save();
    return payment;
  }

  /**
   * 确认付款
   */
  async confirmPayment(paymentId, { actualDate, actualAmount, reference, proof }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('付款记录不存在', 404);
    }

    // 上传支付凭证
    if (proof?.file) {
      const result = await uploadToS3(proof.file);
      proof.url = result.Location;
      delete proof.file;
    }

    payment.actualDate = actualDate;
    payment.amount.actual = actualAmount;
    payment.payment.reference = reference;
    if (proof) {
      payment.payment.proof = proof;
    }
    payment.status = 'paid';

    await payment.save();
    return payment;
  }

  /**
   * 创建变更单
   */
  async createChangeOrder(changeOrderData) {
    // 上传文档
    if (changeOrderData.documents) {
      for (let i = 0; i < changeOrderData.documents.length; i++) {
        const document = changeOrderData.documents[i];
        if (document.file) {
          const result = await uploadToS3(document.file);
          changeOrderData.documents[i].url = result.Location;
          delete changeOrderData.documents[i].file;
        }
      }
    }

    // 上传影响范围附件
    if (changeOrderData.impact?.scope?.attachments) {
      for (let i = 0; i < changeOrderData.impact.scope.attachments.length; i++) {
        const attachment = changeOrderData.impact.scope.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          changeOrderData.impact.scope.attachments[i].url = result.Location;
          delete changeOrderData.impact.scope.attachments[i].file;
        }
      }
    }

    const changeOrder = await ChangeOrder.create(changeOrderData);
    return changeOrder;
  }

  /**
   * 获取变更单
   */
  async getChangeOrder(changeOrderId) {
    const changeOrder = await ChangeOrder.findById(changeOrderId)
      .populate('contract', 'code name')
      .populate('documents.uploadedBy', 'name')
      .populate('impact.scope.attachments.uploadedBy', 'name')
      .populate('approval.workflow.approver', 'name')
      .populate('approval.finalApproval.approvedBy', 'name')
      .populate('implementation.verifiedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!changeOrder) {
      throw new AppError('变更单不存在', 404);
    }

    return changeOrder;
  }

  /**
   * 获取变更单列表
   */
  async getChangeOrders(query = {}) {
    const {
      page = 1,
      limit = 10,
      contract,
      type,
      status,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    if (contract) filter.contract = contract;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let sort = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'type':
          sort = { type: 1 };
          break;
        case 'status':
          sort = { status: 1 };
          break;
      }
    }

    const total = await ChangeOrder.countDocuments(filter);
    const changeOrders = await ChangeOrder.find(filter)
      .populate('contract', 'code name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      changeOrders
    };
  }

  /**
   * 更新变更单
   */
  async updateChangeOrder(changeOrderId, updateData) {
    const changeOrder = await ChangeOrder.findById(changeOrderId);
    if (!changeOrder) {
      throw new AppError('变更单不存在', 404);
    }

    // 上传新文档
    if (updateData.documents) {
      for (let i = 0; i < updateData.documents.length; i++) {
        const document = updateData.documents[i];
        if (document.file) {
          const result = await uploadToS3(document.file);
          updateData.documents[i].url = result.Location;
          delete updateData.documents[i].file;
        }
      }
    }

    // 上传新的影响范围附件
    if (updateData.impact?.scope?.attachments) {
      for (let i = 0; i < updateData.impact.scope.attachments.length; i++) {
        const attachment = updateData.impact.scope.attachments[i];
        if (attachment.file) {
          const result = await uploadToS3(attachment.file);
          updateData.impact.scope.attachments[i].url = result.Location;
          delete updateData.impact.scope.attachments[i].file;
        }
      }
    }

    Object.assign(changeOrder, updateData);
    await changeOrder.save();
    return changeOrder;
  }

  /**
   * 审批变更单
   */
  async approveChangeOrder(changeOrderId, { step, status, comments, approvedBy }) {
    const changeOrder = await ChangeOrder.findById(changeOrderId);
    if (!changeOrder) {
      throw new AppError('变更单不存在', 404);
    }

    // 更新审批工作流
    const workflowStep = changeOrder.approval.workflow.find(w => w.step === step);
    if (workflowStep) {
      workflowStep.approver = approvedBy;
      workflowStep.status = status;
      workflowStep.date = new Date();
      workflowStep.comments = comments;
    }

    // 如果是最终审批
    if (step === changeOrder.approval.workflow.length) {
      changeOrder.approval.status = status;
      changeOrder.approval.finalApproval = {
        approvedBy,
        approvedAt: new Date(),
        comments
      };

      // 更新变更单状态
      if (status === 'approved') {
        changeOrder.status = 'approved';
        // 更新合同金额
        if (changeOrder.type === 'price' && changeOrder.impact.cost) {
          const contract = await Contract.findById(changeOrder.contract);
          if (contract) {
            contract.amount.value = changeOrder.impact.cost.new;
            await contract.save();
          }
        }
      } else if (status === 'rejected') {
        changeOrder.status = 'rejected';
      }
    }

    await changeOrder.save();
    return changeOrder;
  }

  /**
   * 实施变更
   */
  async implementChangeOrder(changeOrderId, implementationData) {
    const changeOrder = await ChangeOrder.findById(changeOrderId);
    if (!changeOrder) {
      throw new AppError('变更单不存在', 404);
    }

    changeOrder.implementation = {
      ...changeOrder.implementation,
      ...implementationData
    };

    if (implementationData.status === 'completed') {
      changeOrder.implementation.completionDate = new Date();
    }

    await changeOrder.save();
    return changeOrder;
  }

  /**
   * 验证变更实施
   */
  async verifyChangeOrderImplementation(changeOrderId, { result, comments, verifiedBy }) {
    const changeOrder = await ChangeOrder.findById(changeOrderId);
    if (!changeOrder) {
      throw new AppError('变更单不存在', 404);
    }

    changeOrder.implementation.verification = {
      verifiedBy,
      verifiedAt: new Date(),
      result,
      comments
    };

    await changeOrder.save();
    return changeOrder;
  }

  /**
   * 获取合同统计
   */
  async getContractStats(query = {}) {
    const { project, startDate, endDate } = query;

    const filter = {};
    if (project) filter.project = project;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // 合同统计
    const contractStats = await Contract.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount.value' }
        }
      }
    ]);

    // 付款统计
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          ...(project && { contract: { $in: await Contract.find({ project }).distinct('_id') } }),
          ...(startDate && { plannedDate: { $gte: new Date(startDate) } }),
          ...(endDate && { plannedDate: { $lte: new Date(endDate) } })
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          plannedAmount: { $sum: '$amount.planned' },
          actualAmount: { $sum: '$amount.actual' }
        }
      }
    ]);

    // 变更统计
    const changeOrderStats = await ChangeOrder.aggregate([
      {
        $match: {
          ...(project && { contract: { $in: await Contract.find({ project }).distinct('_id') } }),
          ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
          ...(endDate && { createdAt: { $lte: new Date(endDate) } })
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$impact.cost.change' }
        }
      }
    ]);

    return {
      contractStats,
      paymentStats,
      changeOrderStats
    };
  }
}

module.exports = { ContractProvider }; 