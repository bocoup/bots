/*
 * A command to show the status of a defined bocouper for today.
 */
import moment from 'moment';
import {createCommand, createParser} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'status',
  description: 'Show the status of a Bocouper today.',
  usage: '[me | @bocouper]',
}, createParser(({args: [slackname]}, {bot, user}) => {
  if (!slackname) {
    return false;
  }
  else if (slackname === 'me') {
    slackname = user.name;
  }
  else {
    slackname = bot.getName(slackname);
  }
  return query('status', slackname).get(0).then(status => {
    if (!status) {
      return `No bocouper found with the name ${slackname}.`;
    }
    return [
      `> *Status for ${moment().format('MMMM Do, YYYY')}:*`,
      `> *Name:* ${status.bocouper}`,
      `> *Check In Person:* ${status.check_in_person}`,
      `> *Project:* ${status.project || 'n/a'}`,
      `> *Initiative:* ${status.initiative || 'n/a'}`,
      `> *Utilization Type:* ${status.utilization_type || 'n/a'}`,
      `> *Leave Type:* ${status.leave_type || 'n/a'}`,
    ];
  });
}));
