/**
 * 环境变量检查脚本
 * 在部署前运行以确保所有必要的环境变量都已正确设置
 */

require('dotenv').config();

const requiredEnvVars = [
  'MONGODB_URI',
  'PORT',
  'NODE_ENV'
];

const optionalEnvVars = [
  'JWT_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

console.log('=== 环境变量检查 ===');
console.log('检查必需的环境变量...');

let missingVars = false;

// 检查必需的环境变量
requiredEnvVars.forEach(variable => {
  if (!process.env[variable]) {
    console.error(`❌ 缺少必需的环境变量: ${variable}`);
    missingVars = true;
  } else {
    const value = variable.includes('SECRET') || variable.includes('KEY') || variable.includes('URI')
      ? `${process.env[variable].substring(0, 4)}...` // 敏感信息只显示前几个字符
      : process.env[variable];
    console.log(`✅ ${variable}: ${value}`);
  }
});

// 检查可选的环境变量
console.log('\n检查可选的环境变量...');
optionalEnvVars.forEach(variable => {
  if (!process.env[variable]) {
    console.warn(`⚠️ 未设置可选环境变量: ${variable}`);
  } else {
    const value = variable.includes('SECRET') || variable.includes('KEY') 
      ? '已设置 (隐藏)'
      : process.env[variable];
    console.log(`✅ ${variable}: ${value}`);
  }
});

if (missingVars) {
  console.error('\n❌ 检测到缺少必需的环境变量。请先设置这些变量，然后再部署。');
  process.exit(1);
} else {
  console.log('\n✅ 所有必需的环境变量已设置。可以继续部署。');
} 