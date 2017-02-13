/*
 * A command to show who is out today.
 */
import moment from 'moment';
import 'moment-duration-format';

import {createCommand} from 'chatter';

export default createCommand({
  name: 'log',
  description: 'Create a timelog entry',
}, (msg, { bot, user }) => {
  console.log('test', msg)
  const [matched,
    num, type, project, description = 'logged via @timebot'
  ] = msg.match(
    /^([.\d]+)(\w)\s+(\S+)\s+(.*)$/
  ) || []
  if (!matched) {
    return `Unknown log format.  Try:
\`log .5h proj testing the logs\``
  }

  const duration = moment.duration(Number(num), type)
  const logMessage = `:timer_clock:${duration.format('h[h] mm[m]')} ${user.name} [${project}] ${description}`


  return bot.sendResponse({ channel: 'continued-access' }, logMessage)
    .then(() => `Sent: ${logMessage}`)
});
