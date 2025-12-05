module.exports = {
  apps: [
    {
      name: 'alphalink-cms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/alphalink_cms_new', // Đường dẫn tới project trên server
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
