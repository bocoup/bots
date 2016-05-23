/*
 * A command to show the current sha.
 */
import {execSync} from 'child_process';
import {createCommand} from 'chatter';

export default createCommand({
  name: 'version',
  description: 'Show the current running version.',
}, () => {
  const sha = execSync('git rev-parse HEAD').toString().trim();
  return `> The currently running SHA is *${sha}*.`;
});
