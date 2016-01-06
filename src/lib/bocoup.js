/*
 * Wrappers for getting data from the Bocoup API
 * In the future these will likely communicate directly with the database.
 */
const jsonapi = require('./jsonapi');

exports.employeeBySlackName = employeeBySlackName;
exports.utilizationsOn = utilizationsOn;

function employeeBySlackName (name) {
  return jsonapi.fetch({
    url: 'https://api.bocoup.com/v3/employees',
    qs: {
      filter: {
        slack: name
      }
    }
  }).then(function (results) {
    if (results.data && results.data.length === 0) {
      throw new Error('No Bocouper with that slack name found.');
    }
    return jsonapi.parse(results);
  });
}

function utilizationsOn (date, employee_id) {
  const filtering = { start: date, end: date };
  if (employee_id) {
    filtering.employee_id = employee_id;
  }
  return jsonapi.fetch({
    url: 'https://api.bocoup.com/v3/utilizations',
    qs: {
      filter: filtering,
      include: 'employee,initiative,type,leave-request-type,project'
    }
  }).then(function (results) {
    if (results.length === 0) {
      throw new Error('No utilizations found on '+date);
    }
    return jsonapi.parse(results);
  });
}
