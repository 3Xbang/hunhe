/**
 * 项目文件模型
 */
const mongoose = require('mongoose');

const projectFileSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['contract', 'design', 'report', 'photo', 'other'],
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  description: String,
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('ProjectFile', projectFileSchema); 