/*
 * A stub for the "status" command.
 */
import {createCommand} from 'chatter';

export default createCommand({
  name: 'status',
  description: 'Displays the status of the current pom.',
}, () => {
  // get pom status
  const pomStatus = 'running';

  // note - in the near future this will list the `i will` command tasks
  switch (pomStatus) {
    case 'running':
      // if pom is running
      return 'there are *X minutes* left in the current pom.';
      break;
    case 'break':
      // if pom is on break
      return `there are *X minutes* left in the current break.`;
      break;
    default:
      // if pom is not running
      return 'there is no pom running.';
      break;
  }
});
