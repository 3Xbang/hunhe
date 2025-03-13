#!/bin/bash

echo "===== 应用初始化脚本 ====="

# 设置工作目录
cd /home/devbox/project

# 检查并创建中间件目录
if [ ! -d ./src/middlewares ]; then
  echo "创建 middlewares 目录..."
  mkdir -p ./src/middlewares
fi

# 检查并创建role.middleware.js文件
if [ ! -f ./src/middlewares/role.middleware.js ]; then
  echo "创建 role.middleware.js 文件..."
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

# 检查其他可能的问题或需要创建的文件
# ...

echo "初始化完成，正在启动应用..."

# 启动应用
exec node src/app.js
