/*
 * A stub for the "i will" command.
 */
import {createCommand} from 'chatter';

export default createCommand({
  name: 'i will',
  description: 'Records the users task for the upcoming pom.',
}, () => {
  return `> Theoretically we will all be doing things.`;
});
