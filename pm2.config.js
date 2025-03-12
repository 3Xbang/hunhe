module.exports = {
  apps: [
    {
      name: "construction-app",
      script: "src/app.js",
      instances: 1,          // 初始使用单个实例
      exec_mode: "fork",     // 使用fork模式运行
      watch: false,          // 文件更改时自动重启
      max_memory_restart: "500M", // 内存超过500M时自动重启
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      },
      error_file: "logs/pm2/error.log",
      out_file: "logs/pm2/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // 自动重启设置
      exp_backoff_restart_delay: 100, // 自动重启延迟
      max_restarts: 10, // 最大重启次数
    }
  ]
} 