/*
 * A stub for the "i will" command.
 */

import {createCommand} from 'chatter';
import {states} from '../pomConfig';

export default function(pom) {
  return createCommand({
    name: 'i will',
    description: 'Records a users task for the next pom.',
  }, (message, {user, channel}) => {
    switch (pom.state) {
      case states.RUNNING:
        return `it's too late to declare a task, a pom is running with *${pom.getTimeString(pom.timeLeft)}* left.`;
        break;
      default:
        // if pom is not running or is on break, let user record task
        pom.taskCollection[user.name] = message;
        return `${user.name}'s task for the next pom is "${message}". you can start this pom with the command \`start\``;
        break;
    }
  });
}
