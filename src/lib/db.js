const config = require('../../config');
const knex = require('knex');

module.exports = knex({
  client: 'pg',
  connection: config.db
});
