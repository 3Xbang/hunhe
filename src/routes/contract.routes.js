/**
 * 合同管理路由
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const contractProvider = require('../providers/contract.provider');
const {
  validateCreateContract,
  validateUpdateContract,
  validateContractApproval,
  validateContractSigning,
  validateCreatePayment,
  validateUpdatePayment,
  validatePaymentApproval,
  validatePaymentConfirmation,
  validateCreateChangeOrder,
  validateUpdateChangeOrder,
  validateChangeOrderApproval,
  validateChangeOrderImplementation,
  validateChangeOrderVerification
} = require('../middlewares/validators/contract.validator');

// 合同路由
router.post(
  '/contracts',
  auth,
  upload.array('documents'),
  validateCreateContract,
  async (req, res, next) => {
    try {
      const contract = await contractProvider.createContract({
        ...req.body,
        documents: req.files,
        createdBy: req.user.id
      });
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/contracts', auth, async (req, res, next) => {
  try {
    const contracts = await contractProvider.getContracts(req.query);
    res.json(contracts);
  } catch (error) {
    next(error);
  }
});

router.get('/contracts/:id', auth, async (req, res, next) => {
  try {
    const contract = await contractProvider.getContract(req.params.id);
    res.json(contract);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/contracts/:id',
  auth,
  upload.array('documents'),
  validateUpdateContract,
  async (req, res, next) => {
    try {
      const contract = await contractProvider.updateContract(req.params.id, {
        ...req.body,
        documents: req.files,
        updatedBy: req.user.id
      });
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/contracts/:id/approval',
  auth,
  validateContractApproval,
  async (req, res, next) => {
    try {
      const contract = await contractProvider.approveContract(req.params.id, {
        ...req.body,
        approvedBy: req.user.id
      });
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/contracts/:id/signing',
  auth,
  validateContractSigning,
  async (req, res, next) => {
    try {
      const contract = await contractProvider.signContract(req.params.id, req.body);
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/contracts/:id/termination',
  auth,
  upload.array('documents'),
  async (req, res, next) => {
    try {
      const contract = await contractProvider.terminateContract(req.params.id, {
        ...req.body,
        documents: req.files
      });
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
);

// 付款记录路由
router.post(
  '/payments',
  auth,
  upload.fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'proof', maxCount: 1 }
  ]),
  validateCreatePayment,
  async (req, res, next) => {
    try {
      const files = {
        invoice: req.files?.invoice?.[0],
        proof: req.files?.proof?.[0]
      };
      const payment = await contractProvider.createPayment({
        ...req.body,
        invoice: {
          ...req.body.invoice,
          attachment: files.invoice
        },
        payment: {
          ...req.body.payment,
          proof: files.proof
        },
        createdBy: req.user.id
      });
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/payments', auth, async (req, res, next) => {
  try {
    const payments = await contractProvider.getPayments(req.query);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

router.get('/payments/:id', auth, async (req, res, next) => {
  try {
    const payment = await contractProvider.getPayment(req.params.id);
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/payments/:id',
  auth,
  upload.fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'proof', maxCount: 1 }
  ]),
  validateUpdatePayment,
  async (req, res, next) => {
    try {
      const files = {
        invoice: req.files?.invoice?.[0],
        proof: req.files?.proof?.[0]
      };
      const payment = await contractProvider.updatePayment(req.params.id, {
        ...req.body,
        invoice: {
          ...req.body.invoice,
          attachment: files.invoice
        },
        payment: {
          ...req.body.payment,
          proof: files.proof
        },
        updatedBy: req.user.id
      });
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/payments/:id/approval',
  auth,
  validatePaymentApproval,
  async (req, res, next) => {
    try {
      const payment = await contractProvider.approvePayment(req.params.id, {
        ...req.body,
        approvedBy: req.user.id
      });
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/payments/:id/confirmation',
  auth,
  upload.single('proof'),
  validatePaymentConfirmation,
  async (req, res, next) => {
    try {
      const payment = await contractProvider.confirmPayment(req.params.id, {
        ...req.body,
        proof: req.file
      });
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }
);

// 变更单路由
router.post(
  '/change-orders',
  auth,
  upload.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'attachments', maxCount: 10 }
  ]),
  validateCreateChangeOrder,
  async (req, res, next) => {
    try {
      const changeOrder = await contractProvider.createChangeOrder({
        ...req.body,
        documents: req.files?.documents,
        impact: {
          ...req.body.impact,
          scope: {
            ...req.body.impact?.scope,
            attachments: req.files?.attachments
          }
        },
        createdBy: req.user.id
      });
      res.status(201).json(changeOrder);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/change-orders', auth, async (req, res, next) => {
  try {
    const changeOrders = await contractProvider.getChangeOrders(req.query);
    res.json(changeOrders);
  } catch (error) {
    next(error);
  }
});

router.get('/change-orders/:id', auth, async (req, res, next) => {
  try {
    const changeOrder = await contractProvider.getChangeOrder(req.params.id);
    res.json(changeOrder);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/change-orders/:id',
  auth,
  upload.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'attachments', maxCount: 10 }
  ]),
  validateUpdateChangeOrder,
  async (req, res, next) => {
    try {
      const changeOrder = await contractProvider.updateChangeOrder(req.params.id, {
        ...req.body,
        documents: req.files?.documents,
        impact: {
          ...req.body.impact,
          scope: {
            ...req.body.impact?.scope,
            attachments: req.files?.attachments
          }
        },
        updatedBy: req.user.id
      });
      res.json(changeOrder);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/change-orders/:id/approval',
  auth,
  validateChangeOrderApproval,
  async (req, res, next) => {
    try {
      const changeOrder = await contractProvider.approveChangeOrder(req.params.id, {
        ...req.body,
        approvedBy: req.user.id
      });
      res.json(changeOrder);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/change-orders/:id/implementation',
  auth,
  validateChangeOrderImplementation,
  async (req, res, next) => {
    try {
      const changeOrder = await contractProvider.implementChangeOrder(req.params.id, req.body);
      res.json(changeOrder);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/change-orders/:id/verification',
  auth,
  validateChangeOrderVerification,
  async (req, res, next) => {
    try {
      const changeOrder = await contractProvider.verifyChangeOrderImplementation(req.params.id, {
        ...req.body,
        verifiedBy: req.user.id
      });
      res.json(changeOrder);
    } catch (error) {
      next(error);
    }
  }
);

// 统计路由
router.get('/stats', auth, async (req, res, next) => {
  try {
    const stats = await contractProvider.getContractStats(req.query);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 