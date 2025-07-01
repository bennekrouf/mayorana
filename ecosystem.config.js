// PM2 Ecosystem Configuration
// File: ecosystem.config.js
// Smart defaults for mayorana.ch deployment

module.exports = {
  apps: [{
    name: 'mayorana',
    script: 'yarn',
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
    error_file: '/var/log/pm2/mayorana-error.log',
    out_file: '/var/log/pm2/mayorana-out.log',
    log_file: '/var/log/pm2/mayorana-combined.log',
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
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:bennekrouf/mayorana.git',
      path: '/var/www/mayorana',
      
      // Post-deployment commands
      'post-deploy': [
        'yarn install --frozen-lockfile',
        'yarn build',
        'pm2 reload ecosystem.config.js --env production'
      ].join(' && ')
    }
  }
};
