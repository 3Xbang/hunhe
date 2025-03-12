# 建筑工程管理系统API文档

## 概述

本文档详细说明了建筑工程管理系统的API接口规范。系统采用RESTful API设计风格，使用JSON格式进行数据交换。

## 认证

所有API请求都需要在Header中包含Bearer Token进行认证：

```http
Authorization: Bearer <your_token>
```

## 响应格式

所有API响应都遵循以下格式：

```json
{
  "status": "success",
  "data": {
    // 响应数据
  }
}
```

错误响应格式：

```json
{
  "status": "error",
  "error": {
    "message": "错误描述"
  }
}
```

## 状态码

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器错误

## 分页

支持分页的接口使用以下查询参数：

- page: 页码（默认1）
- limit: 每页数量（默认10）

分页响应格式：

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## API接口

### 1. 权限管理

#### 1.1 权限基础操作

##### 创建权限
```http
POST /api/v1/system/permissions
```

##### 获取权限列表
```http
GET /api/v1/system/permissions
```

##### 创建角色
```http
POST /api/v1/system/roles
```

##### 获取角色列表
```http
GET /api/v1/system/roles
```

##### 分配用户角色
```http
POST /api/v1/system/user-roles
```

#### 1.2 高级权限管理

##### 批量分配权限
```http
POST /api/v1/system/batch-assign
```

##### 创建权限模板
```http
POST /api/v1/system/templates
```

##### 获取权限模板列表
```http
GET /api/v1/system/templates
```

##### 应用权限模板
```http
POST /api/v1/system/templates/apply
```

##### 创建数据权限规则
```http
POST /api/v1/system/data-rules
```

##### 获取数据权限规则列表
```http
GET /api/v1/system/data-rules
```

##### 获取权限审计日志
```http
GET /api/v1/system/audit-logs
```

### 2. 文档管理

#### 2.1 基础操作

##### 创建文档
```http
POST /api/v1/documents
```

##### 获取文档列表
```http
GET /api/v1/documents
```

##### 获取文档详情
```http
GET /api/v1/documents/:id
```

##### 更新文档
```http
PATCH /api/v1/documents/:id
```

##### 删除文档
```http
DELETE /api/v1/documents/:id
```

#### 2.2 文档流程

##### 更新文档状态
```http
POST /api/v1/documents/:id/status
```

##### 设置文档权限
```http
POST /api/v1/documents/:id/permissions
```

##### 创建文档版本
```http
POST /api/v1/documents/:id/versions
```

##### 审批文档版本
```http
POST /api/v1/documents/:id/versions/:version/approve
```

##### 借阅文档
```http
POST /api/v1/documents/:id/borrow
```

##### 归还文档
```http
POST /api/v1/documents/:id/return/:borrowingId
```

##### 记录文档阅读
```http
POST /api/v1/documents/:id/read
```

##### 归档文档
```http
POST /api/v1/documents/:id/archive
```

##### 废止文档
```http
POST /api/v1/documents/:id/obsolete
```

#### 2.3 文档查询与统计

##### 搜索文档
```http
GET /api/v1/documents/search
```

##### 文档统计概览
```http
GET /api/v1/documents/stats/overview
```

##### 获取文档报告
```http
GET /api/v1/documents/:id/report
```

### 3. 财务管理

#### 3.1 预算管理

##### 创建预算
```http
POST /api/v1/finance/budgets
```

##### 获取预算列表
```http
GET /api/v1/finance/budgets
```

##### 获取预算详情
```http
GET /api/v1/finance/budgets/:id
```

##### 更新预算
```http
PATCH /api/v1/finance/budgets/:id
```

##### 审批预算
```http
POST /api/v1/finance/budgets/:id/approve
```

##### 获取预算统计
```http
GET /api/v1/finance/budgets/stats/overview
```

#### 3.2 成本管理

##### 创建成本记录
```http
POST /api/v1/finance/costs
```

##### 获取成本列表
```http
GET /api/v1/finance/costs
```

##### 获取成本详情
```http
GET /api/v1/finance/costs/:id
```

##### 更新成本记录
```http
PATCH /api/v1/finance/costs/:id
```

##### 删除成本记录
```http
DELETE /api/v1/finance/costs/:id
```

##### 获取成本统计
```http
GET /api/v1/finance/costs/stats/overview
```

##### 获取成本趋势
```http
GET /api/v1/finance/costs/stats/trend
```

#### 3.3 付款管理

##### 创建付款
```http
POST /api/v1/finance/payments
```

##### 获取付款列表
```http
GET /api/v1/finance/payments
```

##### 获取付款详情
```http
GET /api/v1/finance/payments/:id
```

##### 审批付款
```http
POST /api/v1/finance/payments/:id/approve
```

##### 确认付款
```http
POST /api/v1/finance/payments/:id/confirm
```

##### 获取付款统计
```http
GET /api/v1/finance/payments/stats/overview
```

##### 获取付款计划
```http
GET /api/v1/finance/payments/stats/plan
```

#### 3.4 发票管理

##### 创建发票
```http
POST /api/v1/finance/invoices
```

##### 获取发票列表
```http
GET /api/v1/finance/invoices
```

##### 获取发票详情
```http
GET /api/v1/finance/invoices/:id
```

##### 验证发票
```http
POST /api/v1/finance/invoices/:id/verify
```

##### 作废发票
```http
POST /api/v1/finance/invoices/:id/cancel
```

##### 获取发票统计
```http
GET /api/v1/finance/invoices/stats/overview
```

##### 获取待处理发票
```http
GET /api/v1/finance/invoices/pending/list
```

### 4. 供应商管理

#### 4.1 基础操作

##### 创建供应商
```http
POST /api/v1/suppliers
```

##### 获取供应商列表
```http
GET /api/v1/suppliers
```

##### 获取供应商详情
```http
GET /api/v1/suppliers/:id
```

##### 更新供应商信息
```http
PATCH /api/v1/suppliers/:id
```

#### 4.2 供应商评估

##### 添加评估记录
```http
POST /api/v1/suppliers/:id/evaluations
```

##### 记录交易
```http
POST /api/v1/suppliers/:id/transactions
```

##### 更新合作状态
```http
PATCH /api/v1/suppliers/:id/cooperation
```

##### 更新黑名单状态
```http
PATCH /api/v1/suppliers/:id/blacklist
```

##### 添加资质记录
```http
POST /api/v1/suppliers/:id/qualifications
```

#### 4.3 供应商统计

##### 获取供应商概览
```http
GET /api/v1/suppliers/stats/overview
```

##### 获取过期文档
```http
GET /api/v1/suppliers/stats/expired-docs
```

### 5. 设备管理

#### 5.1 基础操作

##### 创建设备
```http
POST /api/v1/equipment
```

##### 获取设备列表
```http
GET /api/v1/equipment
```

##### 获取设备详情
```http
GET /api/v1/equipment/:id
```

##### 更新设备信息
```http
PATCH /api/v1/equipment/:id
```

#### 5.2 设备使用

##### 记录使用情况
```http
POST /api/v1/equipment/:id/usage
```

##### 记录维护情况
```http
POST /api/v1/equipment/:id/maintenance
```

##### 获取设备统计
```http
GET /api/v1/equipment/stats/overview
```

### 6. 考勤管理

#### 6.1 打卡管理

##### 签到
```http
POST /api/v1/attendance/check-in
```

##### 签退
```http
POST /api/v1/attendance/check-out
```

#### 6.2 考勤记录

##### 获取考勤列表
```http
GET /api/v1/attendance
```

##### 获取考勤详情
```http
GET /api/v1/attendance/:id
```

##### 添加工作内容
```http
POST /api/v1/attendance/:id/work-content
```

##### 记录休息时间
```http
POST /api/v1/attendance/:id/breaks
```

##### 请假记录
```http
POST /api/v1/attendance/:id/leave
```

##### 异常记录
```http
POST /api/v1/attendance/:id/exceptions
```

#### 6.3 考勤统计

##### 员工考勤统计
```http
GET /api/v1/attendance/stats/employee/:employeeId
```

##### 项目考勤统计
```http
GET /api/v1/attendance/stats/project/:projectId
```

##### 异常报告
```http
GET /api/v1/attendance/reports/exceptions
```

### 7. 项目管理

#### 7.1 基础操作

##### 创建项目
```http
POST /api/v1/projects
```

##### 获取项目列表
```http
GET /api/v1/projects
```

##### 获取项目详情
```http
GET /api/v1/projects/:id
```

##### 更新项目信息
```http
PATCH /api/v1/projects/:id
```

##### 删除项目
```http
DELETE /api/v1/projects/:id
```

#### 7.2 项目里程碑

##### 获取里程碑列表
```http
GET /api/v1/projects/:id/milestones
```

##### 创建里程碑
```http
POST /api/v1/projects/:id/milestones
```

#### 7.3 项目风险

##### 获取风险列表
```http
GET /api/v1/projects/:id/risks
```

##### 添加风险记录
```http
POST /api/v1/projects/:id/risks
```

### 8. 物料管理

#### 8.1 基础操作

##### 创建物料
```http
POST /api/v1/materials
```

##### 获取物料列表
```http
GET /api/v1/materials
```

##### 获取物料详情
```http
GET /api/v1/materials/:id
```

##### 更新物料信息
```http
PATCH /api/v1/materials/:id
```

#### 8.2 入库出库

##### 入库记录
```http
POST /api/v1/materials/:id/inbound
```

##### 出库记录
```http
POST /api/v1/materials/:id/outbound
```

#### 8.3 物料统计

##### 库存不足统计
```http
GET /api/v1/materials/stats/low-stock
```

##### 物料概览统计
```http
GET /api/v1/materials/stats/overview
``` 