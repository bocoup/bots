'use strict';

const fs = require('fs');
const path = require('path');

function readKey(file) {
  const filepath = path.join(__dirname, file);
  const ext = path.extname(filepath);
  try {
    if (ext === '.json') {
      return require(filepath);
    }
    return fs.readFileSync(filepath, 'utf8').replace(/^\s+|\s+$/g, '');
  }
  catch (e) {
    return null;
  }
}
const email = readKey('secrets/ses.json');

module.exports = {
  robocoup: process.env.TOKEN_ROBOCOUP || readKey('TOKEN_ROBOCOUP'),
  thanksbot: process.env.TOKEN_THANKSBOT || readKey('TOKEN_THANKSBOT'),
  badgebot: process.env.TOKEN_BADGEBOT || readKey ('TOKEN_BADGEBOT'),
  runJobs: process.env.RUN_JOBS,
  email: {
    secret: process.env.EMAIL_SECRET || (email && email.secret),
    key: process.env.EMAIL_KEY || (email && email.key),
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
