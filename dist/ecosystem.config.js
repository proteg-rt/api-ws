module.exports = {
    apps: [{
      name: "api-ws",
      script: "./app.js",
      watch: false,
      max_memory_restart: "1000M",
      exec_mode: "cluster",
      instances: 1,
      cron_restart: "0 7,12,16 * * *",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }]
  }
  