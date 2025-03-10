/**
 * 任务模型
 */
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo'
  },
  startDate: Date,
  dueDate: Date,
  completedDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema); 