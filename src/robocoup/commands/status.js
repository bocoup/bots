/*
 * A command to show the status of a defined bocouper for today.
 */
const R = require('ramda');
const moment = require('moment');

const jsonapi = require('../../lib/jsonapi');
const bocoup = require('../../lib/bocoup');

exports.usage = 'Show the status of a Bocouper today:\n`Usage: status [slackname]`';
exports.handler = handler;

function handler (user, slackname) {
  console.log(slackname);
  if (!slackname) {
    return 'No Bocouper specified.';
  }
  const normalizedName = slackname.replace(/@/g,'');
  const today = moment().format('YYYY-MM-DD');
  const utilizationForBocouper = bocoup.utilizationsOn.bind(null, today);
  return bocoup.employeeBySlackName(normalizedName)
    .get('data')
    .get(0)
    .get('id')
    .then(utilizationForBocouper)
    .then(reply);
}
function reply (api) {
  if (api.errors || api.data.length === 0) {
    throw new Error('No utilization found for '+slackname+' on '+today);
  }
  const utilization = api.data[0];
  const bocouper = utilization.relationships.employee.data;
  const relations = [
    'project',
    'initiative',
    'type',
    'leaveRequestType'
  ].reduce(function (result, relation) {
    const rel = utilization.relationships[relation].data;
    result[relation] = (rel && rel.attributes && rel.attributes.name) || 'n/a';
    return result;
  }, {})
  return [
    '*Status for '+moment().format('MMMM Do, YYYY')+'*',
    '*Name:* '+bocouper.attributes.first+' '+bocouper.attributes.last,
    '*Project:* '+relations.project,
    '*Initiative:* '+relations.initiative,
    '*Utilization Type:* '+relations.type,
    '*Leave Type:* '+relations.leaveRequestType
  ].join('\n');
}
