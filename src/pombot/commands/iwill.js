/*
 * A stub for the "i will" command.
 */

import {createCommand, createParser} from 'chatter';
// import states from '../states';

export default function(pom) {
  return createCommand({
    name: 'i will',
    description: 'TBA',
  }, (message, {user}) => {
    return createParser(parsed => {
      return `${parsed.input} right back atcha, ${user.name}!`;
    });
  });
}
