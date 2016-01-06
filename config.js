const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  creds: isProduction ? require('../bots') : require('./bots'),
  isProduction: isProduction,
  env: process.env.NODE_ENV ? 'production' : 'staging'
};
