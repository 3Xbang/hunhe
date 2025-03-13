#!/bin/bash

echo "===== Sealos高级配置修复方案 ====="

cat << EOF

根据您提供的截图，我们发现Sealos使用了高级配置来覆盖容器的启动命令。
目前的配置如下：
- 运行命令: /bin/bash -c
- 命令参数: /home/devbox/project/entrypoint.sh

有两种方法可以解决这个问题：

方法一: 构建适配这个配置的镜像（推荐）
---------------------------------------
1. 运行以下命令构建新镜像:
   ./entrypoint-fix.sh

2. 重新部署应用:
   kubectl rollout restart deployment/gybang1-release-lazgll -n ns-jrnsq1vz

方法二: 修改Sealos高级配置（更简单）
---------------------------------------
您可以直接修改Sealos中的高级配置:

1. 点击上图中的"高级配置"部分
2. 将"运行命令"保持为 /bin/bash -c
3. 将"命令参数"更改为以下内容:
   cd /app && node src/app.js

这样，无论容器内部结构如何，Sealos都会直接进入/app目录并执行正确的应用程序。

EOF

echo "===== 修复建议结束 =====" 