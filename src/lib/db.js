const fs = require('fs');
const path = require('path');

const knex = require('knex');
const config = require('../../config');

const DB = exports.DB = knex({
  client: 'pg',
  connection: config.db
});

function loadQueries(sqlDir) {
  return fs.readdirSync(sqlDir).reduce(function (queries, filename) {
    const pathDetails = path.parse(filename);
    if (pathDetails.ext === '.sql') {
      queries[pathDetails.name] = function () {
        const sql = fs.readFileSync(path.join(sqlDir, filename), {
          encoding: 'utf-8'
        });
        return DB.raw(sql, Array.prototype.slice.call(arguments));
      };
    }
    return queries;
  }, {});
}

exports.DB = DB;
exports.queries = loadQueries(path.join(__dirname, '..', 'db'));
