/*
 * A stub for the "status" command.
 */
import {createCommand} from 'chatter';

export default createCommand({
  name: 'status',
  description: 'Displays the status of the current pom.',
}, () => {
  return `> Status: to be determined.`;
});
