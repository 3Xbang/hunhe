# 建筑公司内部管理和客户服务中心

## 项目概述
本系统是一个基于 Node.js + Express + MongoDB 的建筑公司综合管理平台，采用 MCP (Model-Controller-Provider) 架构模式开发。

## 核心功能模块
1. **认证与用户管理**
   - 用户注册、登录、权限控制
   - 角色管理：管理员、项目经理、员工等
   - 个人信息管理

2. **项目管理系统**
   - 项目基础信息管理
   - 里程碑管理
   - 风险管理
   - 资源分配
   - 成本控制
   - 项目文档管理

3. **设备管理系统**
   - 设备信息管理
   - 设备使用记录
   - 设备维护管理
   - 设备状态监控
   - 设备统计分析

4. **材料管理系统**
   - 材料库存管理
   - 材料入库/出库记录
   - 材料使用跟踪
   - 库存预警
   - 供应商管理

5. **财务管理系统**
   - 预算管理
   - 收支记录
   - 发票管理
   - 财务报表
   - 成本分析

6. **其他业务模块**
   - 考勤管理
   - 任务管理
   - 客户管理
   - 采购管理

## 技术架构
- **后端框架**：Node.js + Express
- **数据库**：MongoDB
- **认证**：JWT
- **文件存储**：AWS S3/本地文件系统
- **API文档**：apiDoc
- **日志**：Winston
- **测试**：Jest + Supertest
- **代码规范**：ESLint + Prettier

## 项目结构
src/
├── config/           # 配置文件
├── models/           # 

# 建筑管理系统

这是一个基于Node.js和Express框架开发的建筑管理系统后端服务。

## 功能

- MongoDB数据库连接
- RESTful API接口
- JWT认证
- 文件上传处理
- 健康检查端点

## 技术栈

- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## 环境要求

- Node.js 14+
- MongoDB 4+

## 安装

```bash
# 克隆仓库
git clone [仓库地址]

# 安装依赖
cd construction-management
npm install
```

## 配置

1. 复制环境变量模板文件
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，设置以下变量:
   - `PORT` - 服务器端口号
   - `NODE_ENV` - 环境模式 (development, production)
   - `MONGODB_URI` - MongoDB连接字符串
   - `JWT_SECRET` - JWT签名密钥

## 部署

使用提供的部署脚本:

```bash
./deploy.sh
```

或手动执行以下步骤:

1. 检查环境变量:
   ```bash
   node check-env.js
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动应用:
   ```bash
   NODE_ENV=production forever start src/app.js
   ```

## 访问API

部署后，可以通过以下URL访问:

- 健康检查: `http://[服务器地址]:3000/health`
- API信息: `http://[服务器地址]:3000/api/info`

## 日志

应用日志保存在 `logs` 目录下:
- `logs/access.log` - HTTP请求日志
- 使用 `forever logs` 命令查看应用运行日志

## 许可证

[指定许可证] 