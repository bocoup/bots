/*
 * The `status` command, which describes the status of a current Pom.
 */
import {createCommand} from 'chatter';
import {states} from '../pomConfig';

export default function(pom) {
  return createCommand({
    name: 'status',
    description: 'Displays the status of the current pom.',
  }, (message, {channel}) => {

    // retrieve any tasks in this pom.
    const taskList = [];
    for (const user in pom.taskCollection) {
      taskList.push(`> ${user} will ${pom.taskCollection[user]}`);
    }

    const taskHeader = (taskList.length > 0) ? 'here is the task list:' : 'there are no tasks declared.';

    switch (pom.state) {
      case states.RUNNING:
      case states.ON_BREAK:
        // if pom is running, get time left
        const timeLeft = pom.getTimeString(pom.timeLeft);
        return [`a pom is currently running with *${timeLeft}* left and ${taskHeader}`, taskList];
        break;
      default:
        // if pom is not running
        return [`there is no pom currently running – start one with the command \`start\`. ${taskHeader}`, taskList];
        break;
    }
  });
}
