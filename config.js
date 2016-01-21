'use strict';

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  creds: isProduction ? require('../bots') : require('./bots'),
  isProduction: isProduction,
  runJobs: isProduction,
  env: isProduction ? 'production' : 'staging',
  db: {
    host: process.env.DB_HOST || 'db.loc',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'bocoup',
  },
};
