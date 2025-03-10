# 开发环境搭建指南

## 系统要求
- Node.js >= 14.x
- MongoDB >= 4.4
- npm >= 6.x

## 环境变量配置
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/construction-management

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 文件存储配置
STORAGE_TYPE=local # 或 s3
S3_BUCKET=your-bucket-name
S3_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 开发工具配置
### VSCode 推荐配置
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 推荐的 VSCode 插件
- ESLint
- Prettier
- MongoDB for VS Code
- REST Client 