/**
 * 客户看板模型
 */
const mongoose = require('mongoose');

const clientDashboardSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    notifications: [{
      type: String,
      message: String,
      createdAt: Date,
      read: {
        type: Boolean,
        default: false
      }
    }],
    lastViewed: Date
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    notificationFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'realtime'],
      default: 'realtime'
    }
  },
  feedback: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ClientDashboard', clientDashboardSchema); 