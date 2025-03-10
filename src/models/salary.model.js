/**
 * 工资模型
 */
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Date,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  overtime: {
    hours: Number,
    amount: Number
  },
  bonus: {
    type: Number,
    default: 0
  },
  deductions: {
    tax: Number,
    insurance: Number,
    other: Number
  },
  netAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid'],
    default: 'pending'
  },
  paymentDate: Date,
  remarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Salary', salarySchema); 