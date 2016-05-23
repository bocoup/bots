/*
 * A stub for the "start" command.
 */
import {createCommand} from 'chatter';

export default createCommand({
  name: 'start',
  description: 'Starts a pom timer.',
}, () => {
  return `> Theoretically I should be starting a pom right now.`;
});
