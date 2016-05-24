/*
 * The `start` command, which starts a Pom.
 */
import {createCommand} from 'chatter';
import states from '../states';

export default function(pom) {
  return createCommand({
    name: 'start',
    description: 'Starts a pom timer.',
  }, message => {

    switch (pom.state) {
      case states.RUNNING:
        return `there is already a pom running, there are *${pom.getMinutes(pom.timeLeft)} minutes* left.`;
        break;
      case states.ON_BREAK:
        return `we are in the middle of a break, there are *${pom.getMinutes(pom.timeLeft)} minutes* left.`;
        break;
      default:
        // if pom is not running, start a new one
        pom.start();
        return `pom started; you have *${pom.getMinutes(pom.maxSeconds)} minutes*!`;
        break;
    }
  });
}
