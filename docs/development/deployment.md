# 部署指南

## 环境准备
1. Node.js 环境配置
2. MongoDB 数据库配置
3. Nginx 反向代理配置

## 部署步骤
1. 克隆代码
2. 安装依赖
3. 配置环境变量
4. 构建项目
5. 启动服务

## 服务器配置
### Nginx 配置
```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 配置
```json
{
  "apps": [{
    "name": "construction-management",
    "script": "src/app.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
``` 