/**
 * 考勤管理路由
 */
const express = require('express');
const multer = require('multer');
const { AttendanceProvider } = require('../providers/attendance.provider');
const { authenticate } = require('../middlewares/auth');
const {
  validateCheckIn,
  validateCheckOut,
  validateWorkContent,
  validateBreak,
  validateLeaveInfo,
  validateException
} = require('../middlewares/validators/attendance.validator');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const attendanceProvider = new AttendanceProvider();

/**
 * @route POST /api/v1/attendances/check-in
 * @desc 员工签到
 * @access Private
 */
router.post('/check-in', 
  authenticate,
  upload.single('photo'),
  validateCheckIn,
  async (req, res, next) => {
    try {
      const attendance = await attendanceProvider.checkIn({
        ...req.body,
        employee: req.user.id,
        photo: req.file
      });
      res.status(200).json({
        status: 'success',
        data: { attendance }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/attendances/check-out
 * @desc 员工签退
 * @access Private
 */
router.post('/check-out',
  authenticate,
  upload.single('photo'),
  validateCheckOut,
  async (req, res, next) => {
    try {
      const attendance = await attendanceProvider.checkOut({
        ...req.body,
        employee: req.user.id,
        photo: req.file
      });
      res.status(200).json({
        status: 'success',
        data: { attendance }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/v1/attendances
 * @desc 获取考勤列表
 * @access Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await attendanceProvider.getAttendances(req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/attendances/:id
 * @desc 获取考勤详情
 * @access Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const attendance = await attendanceProvider.getAttendance(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { attendance }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/attendances/:id/work-content
 * @desc 添加工作内容
 * @access Private
 */
router.post('/:id/work-content',
  authenticate,
  upload.array('photos', 5),
  validateWorkContent,
  async (req, res, next) => {
    try {
      const workContent = await attendanceProvider.addWorkContent(
        req.params.id,
        {
          ...req.body,
          photos: req.files
        }
      );
      res.status(200).json({
        status: 'success',
        data: { workContent }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/v1/attendances/:id/breaks
 * @desc 添加休息时间
 * @access Private
 */
router.post('/:id/breaks', authenticate, validateBreak, async (req, res, next) => {
  try {
    const breaks = await attendanceProvider.addBreak(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { breaks }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/attendances/:id/leave
 * @desc 更新请假信息
 * @access Private
 */
router.post('/:id/leave', authenticate, validateLeaveInfo, async (req, res, next) => {
  try {
    const leaveInfo = await attendanceProvider.updateLeaveInfo(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { leaveInfo }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/attendances/:id/exceptions
 * @desc 记录异常
 * @access Private
 */
router.post('/:id/exceptions', authenticate, validateException, async (req, res, next) => {
  try {
    const exceptions = await attendanceProvider.addException(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { exceptions }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/attendances/stats/employee/:employeeId
 * @desc 获取员工月度统计
 * @access Private
 */
router.get('/stats/employee/:employeeId', authenticate, async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const stats = await attendanceProvider.getEmployeeMonthlyStats(
      req.params.employeeId,
      parseInt(year),
      parseInt(month)
    );
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/attendances/stats/project/:projectId
 * @desc 获取项目考勤统计
 * @access Private
 */
router.get('/stats/project/:projectId', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await attendanceProvider.getProjectAttendanceStats(
      req.params.projectId,
      startDate,
      endDate
    );
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/attendances/reports/exceptions
 * @desc 获取考勤异常报告
 * @access Private
 */
router.get('/reports/exceptions', authenticate, async (req, res, next) => {
  try {
    const exceptions = await attendanceProvider.getExceptionReport(req.query);
    res.status(200).json({
      status: 'success',
      data: { exceptions }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 