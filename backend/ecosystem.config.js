module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'server.js',
      cwd: './api-gateway',
      watch: false,
    },
    {
      name: 'auth-service',
      script: 'server.js',
      cwd: './auth-service',
      watch: false,
    },
    {
      name: 'otp-service',
      script: 'server.js',
      cwd: './otp-service',
      watch: false,
    },
    {
      name: 'sms-service',
      script: 'server.js',
      cwd: './sms-service',
      watch: false,
    },
    {
      name: 'project-service',
      script: 'server.js',
      cwd: './project-service',
      watch: false,
    },
    {
      name: 'subscription-service',
      script: 'server.js',
      cwd: './subscription-service',
      watch: false,
    },
    {
      name: 'analytics-service',
      script: 'server.js',
      cwd: './analytics-service',
      watch: false,
    },
    {
      name: 'ussd-service',
      script: 'server.js',
      cwd: './ussd-service',
      watch: false,
    }
  ]
};
