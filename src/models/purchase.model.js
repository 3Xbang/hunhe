/**
 * 采购模型
 */
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchaseCode: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  items: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    deliveryDate: Date
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  paymentTerms: String,
  deliveryAddress: String,
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  notes: String,
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Purchase', purchaseSchema); 