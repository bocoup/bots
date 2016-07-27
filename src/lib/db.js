import fs from 'fs';
import path from 'path';
import knex from 'knex';
import Promise from 'bluebird';

import config from '../../config';

export const db = knex({
  client: 'pg',
  connection: config.db,
});

function loadQueries(sqlDir) {
  return fs.readdirSync(sqlDir).reduce((queries, filename) => {
    const {ext, name} = path.parse(filename);
    if (ext === '.sql') {
      queries[name] = (...args) => {
        const sql = fs.readFileSync(path.join(sqlDir, filename), 'utf8');
        return db.raw(sql, args);
      };
    }
    return queries;
  }, {});
}

export const queries = loadQueries(path.join(__dirname, '..', 'db'));

export function query(name, ...args) {
  return Promise.resolve(queries[name](...args)).then(result => result.rows);
}
