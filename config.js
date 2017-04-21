'use strict';

require('dotenv').config();

module.exports = {
  runJobs: process.env.RUN_JOBS,
  tokens: {
    robocoup: process.env.TOKEN_ROBOCOUP,
    thanksbot: process.env.TOKEN_THANKSBOT,
    effortbot: process.env.TOKEN_EFFORTBOT,
  },
  email: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
  },
  db: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGNAME,
    port: process.env.PGPORT,
  },
};
