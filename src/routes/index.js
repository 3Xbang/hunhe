/**
 * API路由索引
 */
const express = require('express');
const projectRoutes = require('./project.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const equipmentRoutes = require('./equipment.routes');
const materialRoutes = require('./material.routes');
const attendanceRoutes = require('./attendance.routes');

const router = express.Router();

// API信息
router.get('/info', (req, res) => {
  res.json({
    name: '建筑管理系统',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    time: new Date()
  });
});

// 挂载各模块路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/materials', materialRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router; 