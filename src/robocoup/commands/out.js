/*
 * A command to show who is out today.
 */
const R = require('ramda');
const moment = require('moment');

const bocoup = require('../../lib/bocoup');
const isOut = R.filter(function (entry) {
  return entry.relationships.leaveRequestType.data;
});
const getBocouper = R.map(function (entry) {
  const bocouper = entry.relationships.employee.data;
  return bocouper.attributes.first+' '+bocouper.attributes.last;
});

exports.usage = 'Show who is out:\n`Usage: out [today]`';
exports.handler = handler;

function handler (user, timeframe) {
  if (!timeframe) {
    return exports.usage;
  }
  const day = moment();
  const dayQuery = day.format('YYYY-MM-DD');
  const dayPretty = day.format('MMMM Do, YYYY');
  return bocoup.utilizationsOn(dayQuery).then(function (api) {
    if (api.errors || api.data.length === 0) {
      throw new Error('No utilizations for '+dayPretty);
    }
    const out = R.compose(getBocouper, isOut);
    return [
      '*Bocoupers out on '+dayPretty+'*',
      out(api.data).join('\n')
    ].join('\n');
  });
}
