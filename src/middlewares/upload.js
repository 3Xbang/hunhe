/**
 * 文件上传中间件
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/appError');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedFileTypes = [
    'image/jpeg', 
    'image/png', 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('不支持的文件类型', 400), false);
  }
};

// 配置上传限制
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 5 // 最多5个文件
};

// 创建上传中间件
const upload = multer({ 
  storage, 
  fileFilter,
  limits 
});

// 为了兼容性，同时提供多种导出方式
module.exports = upload;
module.exports.upload = upload;
module.exports.uploadMiddleware = upload;
module.exports.uploadDir = uploadDir; 