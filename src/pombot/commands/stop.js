/*
 * A stub for the "stop" command.
 */
import {createCommand} from 'chatter';

export default createCommand({
  name: 'stop',
  description: 'Stops the current pom.',
}, () => {
  return `> Theoretically I should be stopping a pom right now.`;
});
