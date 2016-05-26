/*
 * The `status` command, which describes the status of a current Pom.
 */
import {createCommand} from 'chatter';
import {states} from '../pomConfig';

export default function(pom) {
  return createCommand({
    name: 'status',
    description: 'Displays the status of the current pom.',
  }, message => {
    switch (pom.state) {
      case states.RUNNING:
      case states.ON_BREAK:
        // if pom is running, get time left
        const timeLeft = pom.getTimeString(pom.timeLeft);
        return `🍅 there are *${timeLeft}* left in the current pom.`;
        break;
      default:
        // if pom is not running
        const command = (pom.is_im) ? '`start`' : '`pom start`';
        return `🍅 there is no pom currently running – start one with the command ${command}`;
        break;
    }
  });
}
