/*
 * A command to show the current sha.
 */
import {execSync} from 'child_process';

export const usage = 'Show the current version running';

export function handler () {
  const sha = execSync('git rev-parse HEAD').toString().trim();
  return `> The currently running SHA is *${sha}*.`;
}
