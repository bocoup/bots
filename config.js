const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  creds: isProduction ? require('../bots') : require('./bots'),
  isProduction: isProduction,
  env: isProduction ? 'production' : 'staging',
  db: {
    host: isProduction ? '172.31.37.51' : 'db.loc',
    database: 'bocoup',
    user: 'postgres'
  }
};
