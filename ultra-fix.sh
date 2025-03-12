#!/bin/bash

echo "===== 终极路径问题修复工具 ====="

# 1. 添加所有可能的入口文件和修复程序
echo "正在创建各种入口点文件和修复程序..."

# 将应用程序主目录复制到/home/devbox/project，确保文件存在
mkdir -p /home/devbox/project
cp -r /app/src /home/devbox/project/ || echo "无法复制src目录到/home/devbox/project"
cp -r /app/node_modules /home/devbox/project/ || echo "无法复制node_modules到/home/devbox/project"
cp /app/.env /home/devbox/project/ || echo "无法复制.env文件到/home/devbox/project"

# 创建/home/devbox/project/app.js文件
cat > /home/devbox/project/app.js << 'EOL'
/**
 * 终极修复垫片 - 用于解决Sealos环境中的路径问题
 */
console.log('正在加载终极修复垫片...');

// 配置NODE_PATH环境变量，确保能找到node_modules
process.env.NODE_PATH = require('path').join(__dirname, 'node_modules');
require('module').Module._initPaths();

// 记录工作目录和文件位置，便于调试
console.log('当前工作目录:', process.cwd());
console.log('垫片文件位置:', __filename);

// 尝试加载真正的应用文件
const srcAppPath = require('path').join(__dirname, 'src/app.js');
console.log('尝试加载应用:', srcAppPath);

try {
  if (require('fs').existsSync(srcAppPath)) {
    console.log('找到应用文件，正在加载...');
    require(srcAppPath);
  } else {
    console.error('错误: 无法找到应用文件:', srcAppPath);
    process.exit(1);
  }
} catch (err) {
  console.error('加载应用失败:', err);
  process.exit(1);
}
EOL

echo "入口点文件创建完成。"
echo "修复脚本执行完毕。请重新部署应用。"
echo "===== 修复完成 =====" 