/*
 * The `start` command, which starts a Pom.
 */
import {createCommand} from 'chatter';
import {states} from '../pomConfig';

export default function(pom) {
  return createCommand({
    name: 'start',
    description: 'Starts a pom timer.',
  }, message => {

    switch (pom.state) {
      case states.RUNNING:
        return `🍅 there is already a pom running with *${pom.getTimeString(pom.timeLeft)}* left.`;
        break;
      case states.ON_BREAK:
        return `🍅 we are in the middle of a break, there are *${pom.getTimeString(pom.timeLeft)}* left.`;
        break;
      default:
        // if pom is not running, start a new one
        pom.start();
        return `🍅 pom started – you have *${pom.getTimeString(pom.maxSeconds)}* left!`;
        break;
    }
  });
}
