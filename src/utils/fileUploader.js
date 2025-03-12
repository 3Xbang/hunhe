/**
 * 文件上传工具
 */
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('./appError');

// 配置AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * 上传文件到S3或本地
 * @param {Object} file - 文件对象
 * @param {String} folder - 目标文件夹
 * @returns {Promise<String>} 文件URL
 */
exports.uploadFile = async (file, folder = 'general') => {
  try {
    if (!file) return null;
    
    // 检查是否配置了S3
    if (process.env.AWS_ACCESS_KEY_ID && 
        process.env.AWS_SECRET_ACCESS_KEY && 
        process.env.AWS_REGION && 
        process.env.AWS_S3_BUCKET) {
      return await uploadToS3(file, folder);
    } else {
      return await uploadToLocal(file, folder);
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    throw new AppError(500, '文件上传失败');
  }
};

/**
 * 上传文件到S3
 * @param {Object} file - 文件对象
 * @param {String} folder - 目标文件夹
 * @returns {Promise<String>} 文件URL
 */
const uploadToS3 = async (file, folder) => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${uuidv4()}${fileExtension}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
};

/**
 * 上传文件到本地
 * @param {Object} file - 文件对象
 * @param {String} folder - 目标文件夹
 * @returns {Promise<String>} 文件URL
 */
const uploadToLocal = async (file, folder) => {
  const uploadDir = path.join(__dirname, '../../uploads', folder);
  
  // 确保目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const fileExtension = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);
  
  // 写入文件
  await fs.promises.writeFile(filePath, file.buffer);
  
  // 返回相对URL
  return `/uploads/${folder}/${fileName}`;
}; 