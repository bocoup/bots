import {createCommand} from 'chatter';

// Sub-commands.
import findCommand from './expertise/find';
import {forCommand, meCommand} from './expertise/for';
import listCommand from './expertise/list';
import scalesCommand from './expertise/scales';
import statsCommand from './expertise/stats';
import updateCommand from './expertise/update';

export default createCommand({
  name: 'expertise',
  description: 'Show your expertise.',
}, [
  findCommand,
  forCommand,
  meCommand,
  listCommand,
  scalesCommand,
  statsCommand,
  updateCommand,
]);
