#!/bin/bash
# 设置自动备份的cron任务

# 获取当前目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/mongodb-backup.sh"

# 确保备份脚本可执行
chmod +x "$BACKUP_SCRIPT"

# 检查备份脚本是否存在
if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo "错误: 备份脚本不存在: $BACKUP_SCRIPT"
  exit 1
fi

# 为当前用户创建临时crontab文件
TEMP_CRON=$(mktemp)
crontab -l > "$TEMP_CRON" 2>/dev/null || echo "# 建筑管理系统自动备份任务" > "$TEMP_CRON"

# 检查crontab中是否已经有备份任务
if grep -q "$BACKUP_SCRIPT" "$TEMP_CRON"; then
  echo "备份任务已经存在于crontab中"
else
  # 添加每日凌晨2点执行的备份任务
  echo "# 每天凌晨2点执行MongoDB备份" >> "$TEMP_CRON"
  echo "0 2 * * * $BACKUP_SCRIPT >> $SCRIPT_DIR/../logs/mongodb-backup.log 2>&1" >> "$TEMP_CRON"
  
  # 应用新的crontab
  crontab "$TEMP_CRON"
  
  if [ $? -eq 0 ]; then
    echo "成功设置自动备份计划任务"
  else
    echo "设置自动备份计划任务失败"
    exit 1
  fi
fi

# 显示当前的crontab
echo "当前crontab配置:"
crontab -l

# 清理临时文件
rm -f "$TEMP_CRON"

echo "备份将每天凌晨2点自动执行，并记录到 logs/mongodb-backup.log"
echo "您可以通过运行 'crontab -e' 随时修改备份计划" 