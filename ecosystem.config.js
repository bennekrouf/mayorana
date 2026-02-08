// PM2 Ecosystem Configuration
// File: ecosystem.config.js
// Smart defaults for mayorana.ch deployment

module.exports = {
  apps: [{
    name: 'mayorana',
    // script: 'yarn', // Deprecated: relies on global yarn
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',

    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3006
    },

    // Logging (smart defaults)
    // error_file: './logs/mayorana-error.log', // Optional: relative path
    // out_file: './logs/mayorana-out.log', // Optional: relative path
    // log_file: './logs/mayorana-combined.log', // Optional: relative path
    time: true,

    // Auto-restart configuration
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // Optional: Daily restart at 3 AM (after publishing)
    // cron_restart: '0 3 * * *',

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Health monitoring
    monitoring: false  // Set to true if you want PM2+ monitoring
  }],
};
