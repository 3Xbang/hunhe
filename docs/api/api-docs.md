# API文档

生成时间: 3/9/2025, 2:12:14 PM

## auth

### POST /api/v1/auth/register

用户注册

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### POST /api/v1/auth/login

用户登录

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

## business

## device

## finance

## material

## project

### GET /api/v1/projects

获取项目列表

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### GET /api/v1/projects/:id

获取项目详情

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### PATCH /api/v1/projects/:id

更新项目信息

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### POST /api/v1/projects/:id/team

添加项目团队成员

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### DELETE /api/v1/projects/:id/team/:userId

移除项目团队成员

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### POST /api/v1/projects/:id/milestones

添加项目里程碑

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### PATCH /api/v1/projects/:id/milestones/:milestoneId

更新项目里程碑

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### POST /api/v1/projects/:id/risks

添加项目风险

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### PATCH /api/v1/projects/:id/risks/:riskId

更新项目风险

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### POST /api/v1/projects/:id/documents

添加项目文档

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

### GET /api/v1/projects/stats

获取项目统计信息

#### 响应

成功响应:
```json
{
  "status": "success",
  "data": {}
}
```

错误响应:
```json
{
  "status": "error",
  "message": "错误信息"
}
```

