/**
 * 设备模型
 */
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'scrapped'],
    default: 'available'
  },
  currentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  maintenanceHistory: [{
    date: Date,
    description: String,
    cost: Number,
    maintainer: String
  }],
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  expectedLifespan: Number,
  lastMaintenance: Date,
  nextMaintenanceDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema); 