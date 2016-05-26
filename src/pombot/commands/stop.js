/*
 * The `stop` command, which stops a Pom.
 */
import {createCommand} from 'chatter';
import states from '../states';

export default function(pom) {
  return createCommand({
    name: 'stop',
    description: 'Stops the current pom.',
  }, message => {
    switch (pom.state) {
      case states.RUNNING:
      case states.ON_BREAK:
        // if pom is running, get time left stop it
        const timeLeft = pom.getMinutes(pom.timeLeft);
        pom.stop();
        return `pom stopped; there were *${timeLeft} minutes* remaining.`;
        break;
      default:
        // if pom is not running
        // TODO get @sender & set conditional for which start command to use (dm vs room)
        return 'there is no pom currently running; I can start one if you ask me to with `pom start`';
        break;
    }
  });
}
