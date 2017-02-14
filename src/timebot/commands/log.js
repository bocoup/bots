/*
 * A command to show who is out today.
 */
import moment from 'moment';
import 'moment-duration-format';
import {query} from '../../lib/db';

import {createCommand} from 'chatter';

function confirm({inserted: {id, duration} = {}, project, description, user, bot}) {
  const formatted = moment.duration(duration).format('h[h]mm[m]');
  const logMessage = `:timer_clock:${formatted} ${user.name} [${project}] ${description}`;
  let deleted = false;
  let announced = false;
  const channelName = 'continued-access';
  const channel = bot.slack.rtmClient.dataStore.getChannelByName(channelName).id;

  if (!id) {
    return `Error finding *${project}* as a project (or your slack username), try saying *projects* for a list.`;
  }

  setTimeout(() => {
    if (!deleted) {
      bot.sendResponse({channel}, logMessage);
      announced = true;
    }
  }, 30000);

  return {
    message: `This log entry has been stored, you can reply with *undo* if you want to delete it (typo, or any other reason)
${logMessage}`,
    dialog(message) {
      if (message.toLowerCase() === 'undo') {
        deleted = true;
        return query('delete_log', id)
          .then(() => {
            if (announced) {
              bot.sendResponse({channel}, `${user.name} undid that entry`);
            }
            return 'Deleted the last log';
          });
      }
    },
  };
}

export default createCommand({
  name: 'log',
  description: 'Create a timelog entry',
}, (msg, {bot, user}) => {
  const [matched,
    interval, project, description = 'logged via @timebot',
  ] = msg.match(
    /^((?:[.\d]+\s*\w+\s*)+)\s+(\S+)\s+(.*)$/
  ) || [];
  if (!matched) {
    return `Unknown log format.  Try:
\`log 1h 30m proj testing the logs\``;
  }

  return query('insert_log', interval, description, project.toLowerCase(), user.name)
    .then(([inserted]) =>
      confirm({project, description, user, inserted, bot})
    );
});
