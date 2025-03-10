# 编码规范

## JavaScript 规范
- 使用 ES6+ 特性
- 使用 async/await 处理异步
- 使用箭头函数
- 使用解构赋值
- 使用模板字符串

## 命名规范
### 文件命名
- 模型文件：`*.model.js`
- 路由文件：`*.routes.js`
- 服务提供者：`*.provider.js`
- 中间件：`*.middleware.js`
- 验证器：`*.validator.js`

### 变量命名
- 使用驼峰命名法
- 常量使用大写下划线
- 类名使用 PascalCase

## 注释规范
- 所有函数必须包含中文注释
- 使用 JSDoc 格式
- 复杂逻辑必须添加说明

## 错误处理
- 使用统一的错误处理中间件
- 使用自定义 ApiError 类
- 所有异步操作使用 try-catch 