/**
 * 考勤管理模型
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 考勤记录模式
const attendanceRecordSchema = new Schema({
  // 员工ID
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 考勤日期
  date: {
    type: Date,
    required: true
  },

  // 上班打卡
  checkIn: {
    time: Date,          // 打卡时间
    location: {          // 打卡位置
      type: { type: String, default: 'Point' },
      coordinates: [Number]  // [经度, 纬度]
    },
    address: String,     // 详细地址
    device: String,      // 打卡设备
    type: {             // 打卡类型
      type: String,
      enum: ['normal', 'late', 'early'],
      default: 'normal'
    },
    photo: String,      // 打卡照片
    remark: String      // 备注
  },

  // 下班打卡
  checkOut: {
    time: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    address: String,
    device: String,
    type: {
      type: String,
      enum: ['normal', 'early', 'overtime'],
      default: 'normal'
    },
    photo: String,
    remark: String
  },

  // 工作时长（分钟）
  workDuration: {
    type: Number,
    default: 0
  },

  // 加班时长（分钟）
  overtimeDuration: {
    type: Number,
    default: 0
  },

  // 考勤状态
  status: {
    type: String,
    enum: ['normal', 'late', 'early_leave', 'absent', 'leave', 'business_trip'],
    default: 'normal'
  },

  // 异常说明
  abnormalReason: String,

  // 创建和更新信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 请假记录模式
const leaveRecordSchema = new Schema({
  // 员工ID
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 请假类型
  type: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'marriage', 'maternity', 'bereavement', 'other'],
    required: true
  },

  // 开始时间
  startTime: {
    type: Date,
    required: true
  },

  // 结束时间
  endTime: {
    type: Date,
    required: true
  },

  // 请假时长（天）
  duration: {
    type: Number,
    required: true
  },

  // 请假原因
  reason: {
    type: String,
    required: true
  },

  // 证明材料
  attachments: [{
    filename: String,
    originalname: String,
    path: String,
    mimetype: String
  }],

  // 审批状态
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // 审批记录
  approvals: [{
    approver: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected']
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // 创建和更新信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 出差记录模式
const businessTripSchema = new Schema({
  // 员工ID
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 出差目的地
  destination: {
    type: String,
    required: true
  },

  // 开始时间
  startTime: {
    type: Date,
    required: true
  },

  // 结束时间
  endTime: {
    type: Date,
    required: true
  },

  // 出差天数
  duration: {
    type: Number,
    required: true
  },

  // 出差事由
  purpose: {
    type: String,
    required: true
  },

  // 预计费用
  estimatedCost: {
    type: Number,
    required: true
  },

  // 实际费用
  actualCost: {
    type: Number
  },

  // 关联项目
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },

  // 审批状态
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },

  // 审批记录
  approvals: [{
    approver: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected']
    },
    comments: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // 出差报告
  report: {
    content: String,
    attachments: [{
      filename: String,
      originalname: String,
      path: String,
      mimetype: String
    }],
    submittedAt: Date
  },

  // 创建和更新信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 考勤规则模式
const attendanceRuleSchema = new Schema({
  // 规则名称
  name: {
    type: String,
    required: true
  },

  // 规则类型
  type: {
    type: String,
    enum: ['normal', 'flexible', 'shift'],
    default: 'normal'
  },

  // 工作时间
  workTime: {
    startTime: String,  // 格式：HH:mm
    endTime: String,
    flexibleRange: Number,  // 弹性时间范围（分钟）
    breakTime: {
      startTime: String,
      endTime: String
    }
  },

  // 加班规则
  overtimeRule: {
    minimumDuration: Number,  // 最小加班时长（分钟）
    needApproval: Boolean,    // 是否需要审批
    compensationType: {       // 补偿类型
      type: String,
      enum: ['payment', 'leave', 'both']
    }
  },

  // 迟到规则
  lateRule: {
    gracePeriod: Number,     // 宽限时间（分钟）
    penaltyType: String,     // 处罚类型
    penaltyAmount: Number    // 处罚金额或分数
  },

  // 适用部门
  departments: [{
    type: Schema.Types.ObjectId,
    ref: 'Department'
  }],

  // 是否启用
  isActive: {
    type: Boolean,
    default: true
  },

  // 创建和更新信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 创建索引
attendanceRecordSchema.index({ employee: 1, date: 1 });
attendanceRecordSchema.index({ 'checkIn.location': '2dsphere' });
attendanceRecordSchema.index({ 'checkOut.location': '2dsphere' });
leaveRecordSchema.index({ employee: 1, startTime: 1, endTime: 1 });
businessTripSchema.index({ employee: 1, startTime: 1, endTime: 1 });
attendanceRuleSchema.index({ type: 1, isActive: 1 });

// 创建模型
const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
const LeaveRecord = mongoose.model('LeaveRecord', leaveRecordSchema);
const BusinessTrip = mongoose.model('BusinessTrip', businessTripSchema);
const AttendanceRule = mongoose.model('AttendanceRule', attendanceRuleSchema);

module.exports = {
  AttendanceRecord,
  LeaveRecord,
  BusinessTrip,
  AttendanceRule
}; 