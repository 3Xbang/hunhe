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