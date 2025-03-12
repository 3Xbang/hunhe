#!/bin/bash
# MongoDB数据库备份脚本

# 读取环境变量
source ../.env 2>/dev/null || source ../.env.production

# 配置参数
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="../backups/mongodb"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.gz"

# 提取MongoDB连接信息
# 从MONGODB_URI解析用户名、密码、主机和数据库名
if [[ $MONGODB_URI =~ mongodb://([^:]+):([^@]+)@([^:/]+)(:([0-9]+))?/([^?]+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASS="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[5]:-27017}"
  DB_NAME="${BASH_REMATCH[6]}"
  
  if [[ $DB_NAME == *\?* ]]; then
    DB_NAME=$(echo $DB_NAME | cut -d'?' -f1)
  fi
else
  echo "无法解析MongoDB连接字符串: $MONGODB_URI"
  exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 执行备份
echo "开始备份MongoDB数据库: $DB_NAME"
echo "时间: $(date)"
echo "备份文件: $BACKUP_FILE"

mongodump --host="$DB_HOST" --port="$DB_PORT" \
          --username="$DB_USER" --password="$DB_PASS" \
          --authenticationDatabase=admin \
          --db="$DB_NAME" --gzip --archive="$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "备份完成!"
  echo "备份文件大小: $(du -h $BACKUP_FILE | cut -f1)"
  
  # 保留最近30天的备份，删除旧备份
  find "$BACKUP_DIR" -name "backup_*.gz" -type f -mtime +30 -delete
  echo "已清理30天前的旧备份"
else
  echo "备份失败!"
fi

# 列出当前备份文件
echo "当前备份列表:"
ls -lh "$BACKUP_DIR" | grep "backup_"

echo "备份过程结束: $(date)" 