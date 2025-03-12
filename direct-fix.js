#!/usr/bin/env node

/**
 * 紧急修复工具 - 通过直接创建app.js解决路径问题
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检测并输出当前工作目录
const currentDir = process.cwd();
console.log('当前工作目录:', currentDir);

// 创建临时app.js文件在工作目录下
const targetPath = path.join(currentDir, 'app.js');
console.log(`正在创建垫片文件: ${targetPath}`);

// 写入垫片内容
const shimContent = `
/**
 * 自动生成的启动垫片
 * 此文件由direct-fix.js创建
 * 用于解决路径问题
 */
console.log('加载应用程序垫片...');

// 尝试加载真正的应用程序
try {
  // 优先尝试加载/app/src/app.js (标准容器路径)
  if (require('fs').existsSync('/app/src/app.js')) {
    console.log('找到标准路径应用: /app/src/app.js');
    require('/app/src/app.js');
  } 
  // 然后尝试加载当前目录下的src/app.js
  else if (require('fs').existsSync(require('path').join(__dirname, 'src/app.js'))) {
    console.log('找到本地路径应用: ' + require('path').join(__dirname, 'src/app.js'));
    require(require('path').join(__dirname, 'src/app.js'));
  }
  // 如果都找不到，报错
  else {
    console.error('错误: 无法找到有效的应用程序入口文件');
    console.error('已检查: ');
    console.error('  - /app/src/app.js');
    console.error('  - ' + require('path').join(__dirname, 'src/app.js'));
    process.exit(1);
  }
} catch (err) {
  console.error('启动应用程序时出错:', err);
  process.exit(1);
}
`;

// 写入文件
fs.writeFileSync(targetPath, shimContent);
console.log('垫片文件创建成功');

// 检查src目录是否存在
const srcDir = path.join(currentDir, 'src');
if (!fs.existsSync(srcDir)) {
  console.log('创建src目录软链接');
  try {
    execSync('ln -sf /app/src ' + srcDir);
    console.log('src目录软链接创建成功');
  } catch (err) {
    console.error('创建src目录软链接失败:', err);
  }
}

// 检查node_modules是否存在
const modulesDir = path.join(currentDir, 'node_modules');
if (!fs.existsSync(modulesDir)) {
  console.log('创建node_modules软链接');
  try {
    execSync('ln -sf /app/node_modules ' + modulesDir);
    console.log('node_modules软链接创建成功');
  } catch (err) {
    console.error('创建node_modules软链接失败:', err);
  }
}

console.log('修复完成，请重启应用或者直接运行:');
console.log('  node app.js'); 