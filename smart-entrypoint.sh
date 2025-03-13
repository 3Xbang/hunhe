#!/bin/sh

echo "===== 正在启动应用，并检查必要文件 ====="

# 设置工作目录
cd /home/devbox/project

# 检查并创建角色中间件文件
if [ ! -f ./src/middlewares/role.middleware.js ]; then
  echo "缺少 role.middleware.js 文件，正在创建..."
  mkdir -p ./src/middlewares
  cat > ./src/middlewares/role.middleware.js << 'EOF'
const { AppError, unauthorizedError, forbiddenError } = require('../utils/appError');

const checkRole = (...roles) => {
  return (req, res, next) => {
    // 检查用户是否已认证并有角色信息
    if (!req.user || !req.user.role) {
      return next(unauthorizedError('未授权访问，请先登录'));
    }

    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      return next(
        forbiddenError(`角色 ${req.user.role} 没有执行此操作的权限`)
      );
    }

    // 用户有足够权限，继续处理请求
    next();
  };
};

module.exports = {
  checkRole
};
EOF
  echo "role.middleware.js 文件创建完成"
fi

# 检查其他可能需要的文件
# 如果有其他常见错误，可以在这里添加更多的检查和修复

# 启动应用
echo "正在启动应用..."
node src/app.js
