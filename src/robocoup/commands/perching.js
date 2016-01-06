/*
 * A command to show who is out today.
 */
const R = require('ramda');
const moment = require('moment');

const bocoup = require('../../lib/bocoup');
const isPerching = R.filter(function (entry) {
  return entry.relationships.sketchCalendar.data === null &&
    entry.relationships.type.data.id === '11';
});
const getBocouper = R.map(function (entry) {
  const bocouper = entry.relationships.employee.data;
  const project = entry.relationships.project.data;
  return [
    bocouper.attributes.first,
    bocouper.attributes.last,
    'on',
    project ? ' on *'+project.attributes.name+'*' : 'nothing!?'
  ].join(' ');
});

exports.usage = 'Show who is on perch:\n`Usage: perching`';
exports.handler = handler;

function handler (user, timeframe) {
  const day = moment();
  const dayQuery = day.format('YYYY-MM-DD');
  const dayPretty = day.format('MMMM Do, YYYY');
  return bocoup.utilizationsOn(dayQuery).then(function (api) {
    if (api.errors || api.data.length === 0) {
      throw new Error('No utilizations for '+dayPretty);
    }
    const perching = R.compose(getBocouper, isPerching);
    return [
      '*Bocoupers on Perch for '+dayPretty+'*',
      perching(api.data).join('\n')
    ].join('\n');
  });
}
