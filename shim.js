/**
 * 应用程序运行垫片 - 用于解决 Sealos 环境中的路径问题
 */
console.log('加载垫片文件：正在为您解决路径问题...');

const fs = require('fs');
const path = require('path');

// 检测当前工作目录
const workDir = process.cwd();
console.log('当前工作目录:', workDir);

// 查找真正的应用程序入口
let foundPath = null;
const possibleSrcDirs = [
  path.join(workDir, 'src'),     // 当前目录下的src
  '/app/src',                    // 容器标准位置
  path.join(__dirname, 'src')    // 相对于垫片的src目录
];

console.log('正在查找应用程序源代码目录...');
for (const srcDir of possibleSrcDirs) {
  console.log(`检查目录: ${srcDir}`);
  if (fs.existsSync(srcDir)) {
    console.log(`找到源代码目录: ${srcDir}`);
    
    // 检查app.js是否存在
    const appPath = path.join(srcDir, 'app.js');
    if (fs.existsSync(appPath)) {
      foundPath = appPath;
      console.log(`找到应用入口: ${foundPath}`);
      break;
    } else {
      console.log(`警告: ${appPath} 不存在`);
    }
  } else {
    console.log(`目录不存在: ${srcDir}`);
  }
}

if (!foundPath) {
  console.error('错误: 无法找到有效的app.js文件');
  console.error('请确保应用程序代码已正确部署');
  process.exit(1);
}

// 尝试加载并运行应用程序
console.log(`正在加载应用程序: ${foundPath}`);
try {
  require(foundPath);
  console.log('应用程序加载成功');
} catch (error) {
  console.error('加载应用程序时出错:', error);
  console.error('详细错误:', error.stack);
  process.exit(1);
} 