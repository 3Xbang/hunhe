/**
 * 考勤管理服务提供者
 */
const {
  AttendanceRecord,
  LeaveRecord,
  BusinessTrip,
  AttendanceRule
} = require('../models/attendance.model');
const { ApiError } = require('../utils/apiError');
const { uploadFile } = require('../utils/fileUploader');
const moment = require('moment');

class AttendanceProvider {
  /**
   * 打卡
   */
  async checkIn(checkInData) {
    const { employee, location, address, device, photo } = checkInData;

    // 检查是否已打卡
    const today = moment().startOf('day');
    const existingRecord = await AttendanceRecord.findOne({
      employee,
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    });

    if (existingRecord && existingRecord.checkIn) {
      throw new ApiError(400, '今日已打卡');
    }

    // 获取考勤规则
    const rule = await AttendanceRule.findOne({ isActive: true });
    if (!rule) {
      throw new ApiError(404, '未找到有效的考勤规则');
    }

    // 判断打卡类型
    const now = moment();
    const workStartTime = moment(rule.workTime.startTime, 'HH:mm');
    let type = 'normal';

    if (now.isAfter(workStartTime.add(rule.lateRule.gracePeriod, 'minutes'))) {
      type = 'late';
    }

    // 上传打卡照片
    let photoUrl;
    if (photo) {
      const uploadResult = await uploadFile(photo, 'attendance');
      photoUrl = uploadResult.path;
    }

    // 创建或更新考勤记录
    const record = existingRecord || new AttendanceRecord({
      employee,
      date: today.toDate()
    });

    record.checkIn = {
      time: now.toDate(),
      location,
      address,
      device,
      type,
      photo: photoUrl
    };

    await record.save();
    return record;
  }

  /**
   * 下班打卡
   */
  async checkOut(checkOutData) {
    const { employee, location, address, device, photo } = checkOutData;

    // 获取今日考勤记录
    const today = moment().startOf('day');
    const record = await AttendanceRecord.findOne({
      employee,
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    });

    if (!record || !record.checkIn) {
      throw new ApiError(400, '未找到上班打卡记录');
    }

    if (record.checkOut) {
      throw new ApiError(400, '已完成下班打卡');
    }

    // 获取考勤规则
    const rule = await AttendanceRule.findOne({ isActive: true });
    if (!rule) {
      throw new ApiError(404, '未找到有效的考勤规则');
    }

    // 判断打卡类型
    const now = moment();
    const workEndTime = moment(rule.workTime.endTime, 'HH:mm');
    let type = 'normal';

    if (now.isBefore(workEndTime)) {
      type = 'early';
    } else if (now.isAfter(workEndTime.add(rule.overtimeRule.minimumDuration, 'minutes'))) {
      type = 'overtime';
    }

    // 上传打卡照片
    let photoUrl;
    if (photo) {
      const uploadResult = await uploadFile(photo, 'attendance');
      photoUrl = uploadResult.path;
    }

    // 更新考勤记录
    record.checkOut = {
      time: now.toDate(),
      location,
      address,
      device,
      type,
      photo: photoUrl
    };

    // 计算工作时长和加班时长
    const workDuration = moment(record.checkOut.time).diff(moment(record.checkIn.time), 'minutes');
    record.workDuration = workDuration;

    if (type === 'overtime') {
      const overtimeDuration = moment(record.checkOut.time).diff(workEndTime, 'minutes');
      record.overtimeDuration = overtimeDuration;
    }

    await record.save();
    return record;
  }

  /**
   * 获取考勤记录
   */
  async getAttendance(attendanceId) {
    const attendance = await AttendanceRecord.findById(attendanceId)
      .populate('employee', 'name')
      .populate('project', 'name code')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('leaveInfo.approvedBy', 'name')
      .populate('exceptions.handledBy', 'name');

    if (!attendance) {
      throw new ApiError(404, '考勤记录不存在');
    }

    return attendance;
  }

  /**
   * 获取考勤列表
   */
  async getAttendances(query = {}) {
    const {
      page = 1,
      limit = 10,
      employee,
      project,
      status,
      startDate,
      endDate,
      sortBy
    } = query;

    const filter = {};

    // 构建过滤条件
    if (employee) filter.employee = employee;
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 构建排序
    let sort = { date: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'workHours':
          sort = { workHours: -1 };
          break;
        case 'overtimeHours':
          sort = { overtimeHours: -1 };
          break;
      }
    }

    const total = await AttendanceRecord.countDocuments(filter);
    const attendances = await AttendanceRecord.find(filter)
      .populate('employee', 'name')
      .populate('project', 'name code')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      attendances
    };
  }

  /**
   * 添加工作内容
   */
  async addWorkContent(attendanceId, contentData) {
    const attendance = await AttendanceRecord.findById(attendanceId);
    if (!attendance) {
      throw new ApiError(404, '考勤记录不存在');
    }

    // 上传工作照片
    if (contentData.photos?.length) {
      const photoUrls = await Promise.all(
        contentData.photos.map(photo => uploadFile(photo, 'workContent'))
      );
      contentData.photos = photoUrls.map(result => result.path);
    }

    return await attendance.addWorkContent(contentData);
  }

  /**
   * 添加休息时间
   */
  async addBreak(attendanceId, breakData) {
    const attendance = await AttendanceRecord.findById(attendanceId);
    if (!attendance) {
      throw new ApiError(404, '考勤记录不存在');
    }

    return await attendance.addBreak(breakData);
  }

  /**
   * 记录异常
   */
  async addException(attendanceId, exceptionData) {
    const attendance = await AttendanceRecord.findById(attendanceId);
    if (!attendance) {
      throw new ApiError(404, '考勤记录不存在');
    }

    return await attendance.addException(exceptionData);
  }

  /**
   * 更新请假信息
   */
  async updateLeaveInfo(attendanceId, leaveData) {
    const attendance = await AttendanceRecord.findById(attendanceId);
    if (!attendance) {
      throw new ApiError(404, '考勤记录不存在');
    }

    return await attendance.updateLeaveInfo(leaveData);
  }

  /**
   * 获取员工月度统计
   */
  async getEmployeeMonthlyStats(employeeId, year, month) {
    return await AttendanceRecord.getEmployeeMonthlyStats(employeeId, year, month);
  }

  /**
   * 获取项目考勤统计
   */
  async getProjectAttendanceStats(projectId, startDate, endDate) {
    const stats = await AttendanceRecord.aggregate([
      {
        $match: {
          project: projectId,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWorkHours: { $sum: '$workHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' },
          employees: { $addToSet: '$employee' }
        }
      }
    ]);

    const employeeStats = await AttendanceRecord.aggregate([
      {
        $match: {
          project: projectId,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$employee',
          attendanceDays: { $sum: 1 },
          totalWorkHours: { $sum: '$workHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' },
          lateCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
            }
          },
          earlyLeaveCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'early_leave'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          'employee.name': 1,
          attendanceDays: 1,
          totalWorkHours: 1,
          totalOvertimeHours: 1,
          lateCount: 1,
          earlyLeaveCount: 1
        }
      }
    ]);

    return {
      byStatus: stats,
      byEmployee: employeeStats
    };
  }

  /**
   * 获取考勤异常报告
   */
  async getExceptionReport(query = {}) {
    const { startDate, endDate, project, type } = query;

    const filter = {
      'exceptions.0': { $exists: true }
    };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (project) filter.project = project;
    if (type) filter['exceptions.type'] = type;

    const exceptions = await AttendanceRecord.find(filter)
      .populate('employee', 'name')
      .populate('project', 'name code')
      .populate('exceptions.handledBy', 'name');

    return exceptions.map(attendance => ({
      date: attendance.date,
      employee: attendance.employee,
      project: attendance.project,
      exceptions: attendance.exceptions
    }));
  }

  /**
   * 申请请假
   */
  async applyLeave(leaveData, files) {
    const { employee, type, startTime, endTime, reason } = leaveData;

    // 检查日期是否合理
    if (moment(startTime).isAfter(endTime)) {
      throw new ApiError(400, '开始时间不能晚于结束时间');
    }

    // 计算请假天数
    const duration = moment(endTime).diff(moment(startTime), 'days') + 1;

    // 检查是否有重叠的请假记录
    const overlappingLeave = await LeaveRecord.findOne({
      employee,
      status: { $ne: 'rejected' },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gte: startTime }
        },
        {
          startTime: { $lte: endTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    if (overlappingLeave) {
      throw new ApiError(400, '该时间段内已有请假记录');
    }

    // 处理附件上传
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await uploadFile(file, 'leave');
        attachments.push({
          filename: uploadResult.filename,
          originalname: file.originalname,
          path: uploadResult.path,
          mimetype: file.mimetype
        });
      }
    }

    // 创建请假记录
    const leaveRecord = new LeaveRecord({
      employee,
      type,
      startTime,
      endTime,
      duration,
      reason,
      attachments,
      status: 'pending'
    });

    await leaveRecord.save();
    return leaveRecord;
  }

  /**
   * 审批请假
   */
  async approveLeave(leaveId, approvalData) {
    const { status, comments, approver } = approvalData;

    const leaveRecord = await LeaveRecord.findById(leaveId);
    if (!leaveRecord) {
      throw new ApiError(404, '请假记录不存在');
    }

    if (leaveRecord.status !== 'pending') {
      throw new ApiError(400, '该请假申请已审批');
    }

    // 添加审批记录
    leaveRecord.approvals.push({
      approver,
      status,
      comments,
      date: new Date()
    });

    // 更新请假状态
    leaveRecord.status = status;
    leaveRecord.updatedBy = approver;

    // 如果审批通过，更新相关考勤记录
    if (status === 'approved') {
      const startDate = moment(leaveRecord.startTime).startOf('day');
      const endDate = moment(leaveRecord.endTime).endOf('day');

      await AttendanceRecord.updateMany(
        {
          employee: leaveRecord.employee,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          }
        },
        {
          $set: {
            status: 'leave',
            abnormalReason: `${leaveRecord.type}请假`
          }
        }
      );
    }

    await leaveRecord.save();
    return leaveRecord;
  }

  /**
   * 取消请假
   */
  async cancelLeave(leaveId, cancelData) {
    const { reason, operator } = cancelData;

    const leaveRecord = await LeaveRecord.findById(leaveId);
    if (!leaveRecord) {
      throw new ApiError(404, '请假记录不存在');
    }

    if (leaveRecord.status === 'rejected') {
      throw new ApiError(400, '已拒绝的请假不能取消');
    }

    if (moment().isAfter(moment(leaveRecord.startTime))) {
      throw new ApiError(400, '已开始的请假不能取消');
    }

    // 更新请假记录
    leaveRecord.status = 'cancelled';
    leaveRecord.approvals.push({
      approver: operator,
      status: 'cancelled',
      comments: reason,
      date: new Date()
    });
    leaveRecord.updatedBy = operator;

    await leaveRecord.save();
    return leaveRecord;
  }

  /**
   * 申请出差
   */
  async applyBusinessTrip(tripData) {
    const {
      employee,
      destination,
      startTime,
      endTime,
      purpose,
      estimatedCost,
      project
    } = tripData;

    // 检查日期是否合理
    if (moment(startTime).isAfter(endTime)) {
      throw new ApiError(400, '开始时间不能晚于结束时间');
    }

    // 计算出差天数
    const duration = moment(endTime).diff(moment(startTime), 'days') + 1;

    // 检查是否有重叠的出差记录
    const overlappingTrip = await BusinessTrip.findOne({
      employee,
      status: { $nin: ['rejected', 'completed'] },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gte: startTime }
        },
        {
          startTime: { $lte: endTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    if (overlappingTrip) {
      throw new ApiError(400, '该时间段内已有出差记录');
    }

    // 创建出差记录
    const businessTrip = new BusinessTrip({
      employee,
      destination,
      startTime,
      endTime,
      duration,
      purpose,
      estimatedCost,
      project,
      status: 'pending'
    });

    await businessTrip.save();
    return businessTrip;
  }

  /**
   * 审批出差
   */
  async approveBusinessTrip(tripId, approvalData) {
    const { status, comments, approver } = approvalData;

    const businessTrip = await BusinessTrip.findById(tripId);
    if (!businessTrip) {
      throw new ApiError(404, '出差记录不存在');
    }

    if (businessTrip.status !== 'pending') {
      throw new ApiError(400, '该出差申请已审批');
    }

    // 添加审批记录
    businessTrip.approvals.push({
      approver,
      status,
      comments,
      date: new Date()
    });

    // 更新出差状态
    businessTrip.status = status;
    businessTrip.updatedBy = approver;

    // 如果审批通过，更新相关考勤记录
    if (status === 'approved') {
      const startDate = moment(businessTrip.startTime).startOf('day');
      const endDate = moment(businessTrip.endTime).endOf('day');

      await AttendanceRecord.updateMany(
        {
          employee: businessTrip.employee,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          }
        },
        {
          $set: {
            status: 'business_trip',
            abnormalReason: `出差-${businessTrip.destination}`
          }
        }
      );
    }

    await businessTrip.save();
    return businessTrip;
  }

  /**
   * 提交出差报告
   */
  async submitTripReport(tripId, reportData, files) {
    const businessTrip = await BusinessTrip.findById(tripId);
    if (!businessTrip) {
      throw new ApiError(404, '出差记录不存在');
    }

    if (businessTrip.status !== 'approved') {
      throw new ApiError(400, '只能为已审批的出差提交报告');
    }

    if (businessTrip.report && businessTrip.report.submittedAt) {
      throw new ApiError(400, '出差报告已提交');
    }

    // 处理附件上传
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await uploadFile(file, 'tripReports');
        attachments.push({
          filename: uploadResult.filename,
          originalname: file.originalname,
          path: uploadResult.path,
          mimetype: file.mimetype
        });
      }
    }

    // 更新出差报告
    businessTrip.report = {
      content: reportData.content,
      attachments,
      submittedAt: new Date()
    };

    // 更新出差状态和实际费用
    businessTrip.status = 'completed';
    businessTrip.actualCost = reportData.actualCost;
    businessTrip.updatedBy = reportData.submittedBy;

    await businessTrip.save();
    return businessTrip;
  }

  /**
   * 获取请假统计
   */
  async getLeaveStats(query) {
    const { employee, department, startDate, endDate } = query;

    const match = {};
    if (employee) match.employee = employee;
    if (department) match['employee.department'] = department;
    if (startDate || endDate) {
      match.startTime = {};
      if (startDate) match.startTime.$gte = new Date(startDate);
      if (endDate) match.startTime.$lte = new Date(endDate);
    }

    const stats = await LeaveRecord.aggregate([
      {
        $match: match
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeInfo'
        }
      },
      {
        $unwind: '$employeeInfo'
      },
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$duration' },
          employees: { $addToSet: '$employee' }
        }
      }
    ]);

    return stats;
  }

  /**
   * 获取出差统计
   */
  async getBusinessTripStats(query) {
    const { employee, department, project, startDate, endDate } = query;

    const match = {};
    if (employee) match.employee = employee;
    if (department) match['employee.department'] = department;
    if (project) match.project = project;
    if (startDate || endDate) {
      match.startTime = {};
      if (startDate) match.startTime.$gte = new Date(startDate);
      if (endDate) match.startTime.$lte = new Date(endDate);
    }

    const stats = await BusinessTrip.aggregate([
      {
        $match: match
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeInfo'
        }
      },
      {
        $unwind: '$employeeInfo'
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$duration' },
          totalEstimatedCost: { $sum: '$estimatedCost' },
          totalActualCost: { $sum: '$actualCost' },
          employees: { $addToSet: '$employee' }
        }
      }
    ]);

    return stats;
  }
}

module.exports = new AttendanceProvider(); 
module.exports = { AttendanceProvider }; 