#!/bin/sh

# 在容器内部执行的修复脚本，用于解决入口点问题

echo "===== 容器内路径修复工具 ====="

# 显示当前工作目录和环境信息
echo "当前工作目录: $(pwd)"
echo "Node版本: $(node -v)"
echo "容器主机名: $(hostname)"

# 检查是否存在预期的目录
echo "检查关键目录..."
echo "/app目录: $(if [ -d "/app" ]; then echo "存在"; else echo "不存在"; fi)"
echo "/home/devbox/project目录: $(if [ -d "/home/devbox/project" ]; then echo "存在"; else echo "不存在"; fi)"

# 确保/home/devbox/project目录存在
if [ ! -d "/home/devbox/project" ]; then
  echo "创建/home/devbox/project目录"
  mkdir -p /home/devbox/project
fi

# 创建app.js垫片
echo "创建app.js垫片文件..."
cat > /home/devbox/project/app.js << 'EOL'
// 由in-container-fix.sh创建的垫片文件
console.log('启动容器内垫片...');

// 检查工作目录和环境
const process = require('process');
const fs = require('fs');
const path = require('path');

console.log('当前工作目录:', process.cwd());
console.log('Node.js版本:', process.version);

// 查找真正的应用程序路径
const possiblePaths = [
  '/app/src/app.js',
  path.join(__dirname, 'src/app.js')
];

let appPath = null;
for (const testPath of possiblePaths) {
  console.log(`检查路径: ${testPath}`);
  if (fs.existsSync(testPath)) {
    appPath = testPath;
    console.log(`找到应用入口: ${appPath}`);
    break;
  }
}

if (!appPath) {
  console.error('错误: 找不到应用程序入口文件');
  process.exit(1);
}

// 加载应用程序
try {
  console.log(`正在加载应用: ${appPath}`);
  require(appPath);
} catch (err) {
  console.error('加载应用失败:', err);
  process.exit(1);
}
EOL

# 确保/home/devbox/project/src目录存在，如果不存在则创建链接
if [ ! -d "/home/devbox/project/src" ]; then
  echo "创建/home/devbox/project/src软链接..."
  if [ -d "/app/src" ]; then
    ln -sf /app/src /home/devbox/project/src
    echo "src软链接创建成功"
  else
    echo "错误: 源代码目录/app/src不存在"
  fi
fi

# 确保/home/devbox/project/node_modules目录存在，如果不存在则创建链接
if [ ! -d "/home/devbox/project/node_modules" ]; then
  echo "创建/home/devbox/project/node_modules软链接..."
  if [ -d "/app/node_modules" ]; then
    ln -sf /app/node_modules /home/devbox/project/node_modules
    echo "node_modules软链接创建成功"
  else
    echo "错误: 依赖目录/app/node_modules不存在"
  fi
fi

echo "修复完成! 请重启容器或者在/home/devbox/project目录运行: node app.js"
echo "===== 修复脚本执行完毕 =====" 