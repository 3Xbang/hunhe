/**
 * 交易记录模型
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'CNY'
  },
  category: {
    type: String,
    required: true,
    enum: ['project_payment', 'salary', 'material', 'equipment', 'operation', 'other']
  },
  description: String,
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema); 