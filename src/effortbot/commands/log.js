/*
 * A command to show who is out today.
 */
import moment from 'moment';
import 'moment-duration-format';
import {query} from '../../lib/db';

import {createCommand} from 'chatter';

export default createCommand({
  name: 'log',
  description: 'Create a timelog entry',
}, (msg, {bot, user}) => {
  const [matched,
    interval, project, description = 'logged via @effortbot',
  ] = msg.match(
    /^((?:[.\d]+\s*\w+\s*)+)\s+(\S+)\s+(.*)$/
  ) || [];
  if (!matched) {
    return `Unknown log format.  Try:
\`log 1h 30m proj testing the logs\``;
  }

  return query('time_insert_log', interval, description, project.toLowerCase(), user.name)
    .then(([inserted]) => {
      if (!inserted) {
        return `Error finding *${project}* as a project (or your slack username), try saying *projects* for a list.`;
      }

      const {duration} = inserted;
      const formatted = moment.duration(duration).format('h[h]mm[m]');
      const logMessage = `:timer_clock:${formatted} ${user.name} [${project}] ${description}`;
      const channelName = 'continued-access';
      const channel = bot.slack.rtmClient.dataStore.getChannelByName(channelName).id;

      bot.sendResponse({channel}, logMessage);

      return `This log entry has been stored.\n${logMessage}`;
    });
});
