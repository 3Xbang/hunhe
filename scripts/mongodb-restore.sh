#!/bin/bash
# MongoDB数据库恢复脚本

# 读取环境变量
source ../.env 2>/dev/null || source ../.env.production

# 默认值和帮助信息
BACKUP_DIR="../backups/mongodb"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup_*.gz 2>/dev/null | head -1)

# 显示帮助
function show_help {
  echo "用法: $0 [选项]"
  echo "MongoDB恢复工具"
  echo "选项:"
  echo "  -f, --file FILE    指定要恢复的备份文件"
  echo "  -l, --list         列出可用的备份文件"
  echo "  -h, --help         显示此帮助信息"
  echo "示例:"
  echo "  $0 --list          # 列出所有备份"
  echo "  $0 --file backup_20250310_123456.gz  # 恢复指定备份"
  echo "  $0                 # 恢复最近的备份"
}

# 列出可用备份
function list_backups {
  echo "可用备份文件:"
  ls -lht $BACKUP_DIR/backup_*.gz 2>/dev/null || echo "没有找到备份文件"
}

# 解析参数
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      BACKUP_FILE="$BACKUP_DIR/$2"
      shift 2
      ;;
    -l|--list)
      list_backups
      exit 0
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "未知选项: $1"
      show_help
      exit 1
      ;;
  esac
done

# 如果没有指定备份文件，使用最新的备份
if [ -z "$BACKUP_FILE" ]; then
  if [ -z "$LATEST_BACKUP" ]; then
    echo "错误: 找不到可用的备份文件"
    exit 1
  fi
  BACKUP_FILE="$LATEST_BACKUP"
  echo "使用最新备份: $(basename $BACKUP_FILE)"
fi

# 确认文件存在
if [ ! -f "$BACKUP_FILE" ]; then
  echo "错误: 备份文件不存在: $BACKUP_FILE"
  exit 1
fi

# 提取MongoDB连接信息
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

# 确认是否继续
echo "警告: 恢复操作将覆盖数据库中的现有数据!"
echo "准备恢复数据库: $DB_NAME"
echo "从备份文件: $BACKUP_FILE"
echo "到MongoDB服务器: $DB_HOST:$DB_PORT"
read -p "是否继续? (y/n): " confirm

if [[ $confirm != [yY] ]]; then
  echo "操作已取消"
  exit 0
fi

# 执行恢复
echo "开始恢复数据库..."
echo "时间: $(date)"

mongorestore --host="$DB_HOST" --port="$DB_PORT" \
            --username="$DB_USER" --password="$DB_PASS" \
            --authenticationDatabase=admin \
            --nsInclude="$DB_NAME.*" \
            --gzip --archive="$BACKUP_FILE" \
            --drop

if [ $? -eq 0 ]; then
  echo "恢复成功!"
else
  echo "恢复失败!"
fi

echo "恢复过程结束: $(date)" 