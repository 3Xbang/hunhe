/**
 * 材料交易记录模型
 */
const mongoose = require('mongoose');

const materialTransactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialBatch'
  },
  quantity: {
    type: Number,
    required: true
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
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MaterialTransaction', materialTransactionSchema); 