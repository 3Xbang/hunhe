# 数据库设计文档

## 数据模型
### 用户模型 (User)
```javascript
{
  username: String,
  password: String,
  email: String,
  role: String,
  status: String
}
```

### 项目模型 (Project)
```javascript
{
  name: String,
  code: String,
  type: String,
  status: String,
  manager: ObjectId,
  team: [ObjectId]
}
```

### 设备模型 (Equipment)
```javascript
{
  code: String,
  name: String,
  model: String,
  category: String,
  status: String
}
```

## 索引设计
- 用户表：username, email
- 项目表：code
- 设备表：code, category, status 