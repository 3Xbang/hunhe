/**
 * 材料批次模型
 */
const mongoose = require('mongoose');

const materialBatchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  manufacturer: String,
  productionDate: Date,
  expiryDate: Date,
  supplier: {
    type: String,
    required: true
  },
  qualityCheck: {
    inspector: String,
    date: Date,
    result: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending'
    },
    notes: String
  },
  status: {
    type: String,
    enum: ['in_stock', 'partially_used', 'used_up'],
    default: 'in_stock'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MaterialBatch', materialBatchSchema); 