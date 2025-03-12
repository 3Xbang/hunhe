/**
 * 文件上传工具
 * 用于处理文件上传到S3或其他存储位置
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('./appError');

// 配置 AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

/**
 * 上传文件到S3
 * @param {Object} file - 文件对象 (multer)
 * @param {string} folder - 存储文件夹
 * @returns {Promise<Object>} 上传结果
 */
const uploadToS3 = async (file, folder = 'general') => {
  try {
    // 生成唯一文件名
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    // 设置上传参数
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    // 执行上传
    const result = await s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key
    };
  } catch (error) {
    throw new AppError('文件上传失败', 500);
  }
};

/**
 * 从S3删除文件
 * @param {string} key - 文件key
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new AppError('文件删除失败', 500);
  }
};

/**
 * 获取文件的签名URL
 * @param {string} key - 文件key
 * @param {number} expires - 过期时间（秒）
 * @returns {Promise<string>} 签名URL
 */
const getSignedUrl = async (key, expires = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expires
    };

    return await s3.getSignedUrlPromise('getObject', params);
  } catch (error) {
    throw new AppError('获取文件访问链接失败', 500);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getSignedUrl
}; 