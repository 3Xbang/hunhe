/**
 * 发票模型
 */
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['receipt', 'payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'cancelled'],
    default: 'draft'
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  client: {
    name: String,
    taxId: String,
    address: String,
    contact: String
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema); 