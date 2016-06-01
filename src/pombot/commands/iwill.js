/*
 * A stub for the "i will" command.
 */
import heredoc from 'heredoc-tag';
import {createCommand} from 'chatter';
import {states} from '../pomConfig';

export default createCommand({
  name: 'i will',
  description: 'Records a users task for the next pom.',
}, (message, {user, channel, pom, getCommand}) => {
  switch (pom.state) {
    case states.RUNNING:
      return `it's too late to declare a task, a pom is running with *${pom.getTimeString(pom.timeLeft)}* left.`;
      break;
    default:
      // if pom is not running or is on break, let user record task
      pom.taskCollection[user.name] = message;
      return heredoc.oneline.trim`
        ${user.name}'s task for the next pom is "${message}".
        You can start this pom with the command \`${getCommand('start')}\`
      `;
      break;
  }
});
