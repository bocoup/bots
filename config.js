'use strict';

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  creds: isProduction ? require('../bots') : require('./bots'),
  isProduction: isProduction,
  runJobs: isProduction,
  env: isProduction ? 'production' : 'staging',
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  },
};
