module.exports = {
  apps: [
    {
      name: 'platonic',
      script: 'server.js',
      interpreter: 'node@8.17.0',
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      autorestart: true,
    },
  ],
};
