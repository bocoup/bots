'use strict';

require('dotenv').config();

module.exports = {
  runJobs: process.env.RUN_JOBS,
  tokens: {
    robocoup: process.env.TOKEN_ROBOCOUP,
    thanksbot: process.env.TOKEN_THANKSBOT,
    pombot: process.env.TOKEN_POMBOT,
  },
  email: {
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  },
  db: {
    // these defaults assume an ssh tunnel to our staging database.
    // see the npm script 'tunnel'
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'bocoup',
    port: process.env.DB_PORT || 5400,
  },
};
