/*
 * A command to show the status of a defined bocouper for today.
 */
const moment = require('moment');

import {query} from '../../lib/db';

export const usage =
  'Show the status of a Bocouper today:\n`Usage: status [slackname]`';

export function handler (meta, slackname) {
  if (!slackname) {
    return 'No slack user specified. To see your own status, try `status me`.'
  }
  if (slackname === 'me') {
    slackname = meta.user.name;
  }
  return query('status', slackname)
    .get(0)
    .then((status) => {
      if (!status) {
        return 'No bocouper found with the name '+slackname;
      }
      return [
        `*Status for ${moment().format('MMMM Do, YYYY')}*`,
        `*Name:* ${status.bocouper}`,
        `*Project:* ${status.project||'n/a'}`,
        `*Initiative:* ${status.initiative}`,
        `*Utilization Type:* ${status.utilization_type}`,
        `*Leave Type:* ${status.leave_type||'n/a'}`
      ];
    });
}
