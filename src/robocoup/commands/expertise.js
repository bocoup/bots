exports.usage = 'Show your expertise.\n`Usage: expertise [me, list]`';
exports.handler = function (user, message) {
  const expertise = require('../../lib/expertise');
  switch (message) {
    case 'me':
      return expertise.getBocouper(user.name).then(function (results) {
        return results.rows.map(function (entry) {
          return Object.keys(entry).map(function (field) {
            return entry[field];
          }).join(' | ');
        }).join('\n')
      });
    case 'list':
      return expertise.getExpertiseById(1).then(function (results) {
        const data = results.rows[0];
        const title = Object.keys(data).map(function (field) {
          return data[field];
        }).join(' | ');
        return expertise.getExpertiseForAll(1).then(function (results) {
          return '*'+title+'*\n'+results.rows.map(function (entry) {
            return Object.keys(entry).map(function (field) {
              return entry[field];
            }).join(' | ');
          }).join('\n')
        });
      });
    default:
      return exports.usage;
  }
};
