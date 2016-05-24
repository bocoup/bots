/*
 * A command to show the status of a defined bocouper for today.
 */
import moment from 'moment';
import {createCommand, createParser} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'status',
  description: 'Show the status of a Bocouper today',
  usage: '[me | @bocouper]',
}, createParser(({remain: [slackname]}, {bot, user}) => {
  if (!slackname) {
    return false;
  }
  else if (slackname === 'me') {
    slackname = user.name;
  }
  else {
    slackname = bot.parseMessage(slackname).replace(/^@/, '');
  }
  return query('status', slackname).get(0).then(status => {
    if (!status) {
      return `No bocouper found with the name ${slackname}.`;
    }
    return [
      `> *Status for ${moment().format('MMMM Do, YYYY')}:*`,
      `> *Name:* ${status.bocouper}`,
      `> *Project:* ${status.project || 'n/a'}`,
      `> *Initiative:* ${status.initiative}`,
      `> *Utilization Type:* ${status.utilization_type}`,
      `> *Leave Type:* ${status.leave_type || 'n/a'}`,
    ];
  });
}));
