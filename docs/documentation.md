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

\n\n---\n\n
# 测试用例文档

生成时间: 3/9/2025, 2:12:15 PM

## auth

### 认证模块

#### 应该成功注册新用户

请求数据:
```json
"{\n          username: userData.username,\n          password: userData.password\n        }"
```

预期响应:
```json
"{\n        status: 'success',\n        data: {\n          user: {\n            username: userData.username,\n            email: userData.email,\n            name: userData.name,\n            role: userData.role,\n            status: 'active'\n          }\n        }\n      }"
```

#### 应该拒绝重复的用户名

请求数据:
```json
"{\n          username: userData.username,\n          password: 'wrongpassword'\n        }"
```

预期响应:
```json
"{\n        status: 'error',\n        message: '用户名或邮箱已存在'\n      }"
```

#### 应该成功登录并返回token

预期响应:
```json
"{\n        status: 'error',\n        message: '用户名或密码错误'\n      }"
```

#### 应该拒绝错误的密码

请求数据:
```json
"{\n          username: userData.username,\n          password: userData.password\n        }"
```

### POST /api/v1/auth/register

#### 应该成功注册新用户

请求数据:
```json
"{\n          username: userData.username,\n          password: 'wrongpassword'\n        }"
```

预期响应:
```json
"{\n        status: 'success',\n        data: {\n          user: {\n            username: userData.username,\n            email: userData.email,\n            name: userData.name,\n            role: userData.role,\n            status: 'active'\n          }\n        }\n      }"
```

#### 应该拒绝重复的用户名

预期响应:
```json
"{\n        status: 'error',\n        message: '用户名或邮箱已存在'\n      }"
```

#### 应该成功登录并返回token

请求数据:
```json
"{\n          username: userData.username,\n          password: userData.password\n        }"
```

预期响应:
```json
"{\n        status: 'error',\n        message: '用户名或密码错误'\n      }"
```

#### 应该拒绝错误的密码

请求数据:
```json
"{\n          username: userData.username,\n          password: 'wrongpassword'\n        }"
```

### POST /api/v1/auth/login

#### 应该成功注册新用户

预期响应:
```json
"{\n        status: 'success',\n        data: {\n          user: {\n            username: userData.username,\n            email: userData.email,\n            name: userData.name,\n            role: userData.role,\n            status: 'active'\n          }\n        }\n      }"
```

#### 应该拒绝重复的用户名

请求数据:
```json
"{\n          username: userData.username,\n          password: userData.password\n        }"
```

预期响应:
```json
"{\n        status: 'error',\n        message: '用户名或邮箱已存在'\n      }"
```

#### 应该成功登录并返回token

请求数据:
```json
"{\n          username: userData.username,\n          password: 'wrongpassword'\n        }"
```

预期响应:
```json
"{\n        status: 'error',\n        message: '用户名或密码错误'\n      }"
```

#### 应该拒绝错误的密码

## project

### 项目管理模块

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

### POST /api/v1/projects

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

### GET /api/v1/projects

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

### 项目团队管理

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

### 项目里程碑管理

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

### 项目风险管理

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

### 项目文档管理

#### 应该成功创建新项目

#### 应该拒绝无效的项目数据

#### 应该返回项目列表

#### 应该支持分页和过滤

#### 应该成功添加团队成员

#### 应该成功移除团队成员

#### 应该成功添加里程碑

#### 应该成功添加风险

#### 应该成功添加文档

