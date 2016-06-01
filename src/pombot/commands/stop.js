/*
 * The `stop` command, which stops a Pom.
 */
import {createCommand} from 'chatter';
import {states} from '../pomConfig';

export default createCommand({
  name: 'stop',
  description: 'Stops the current pom.',
}, (message, {channel, pom, getCommand}) => {
  switch (pom.state) {
    case states.RUNNING:
    case states.ON_BREAK:
      // if pom is running, get time left stop it
      const timeLeft = pom.getTimeString(pom.timeLeft);
      pom.stop();
      return `:tomato: the pom has been stopped with *${timeLeft}* remaining.`;
      break;
    default:
      // if pom is not running
      return `there is no pom currently running – start one with the command \`${getCommand('start')}\``;
      break;
  }
});
