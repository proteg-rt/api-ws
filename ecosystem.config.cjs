module.exports = {
    apps: [{
      name: "api-ws",
      script: "./dist/app.js",
      watch: true,
      max_memory_restart: "1000M",
      exec_mode: "cluster",
      instances: 1,
      cron_restart: "0 7,12,16 * * *",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      },
      // Monitoreo y reinicio automático
      exp_backoff_restart_delay: 100,
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
      // Verificación de salud
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }]
  }
