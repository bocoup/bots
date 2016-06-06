/*
 * A command to show who is out today.
 */
import moment from 'moment';
import {createCommand} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'out',
  description: 'Show who is out today.',
}, () => {
  return query('out_today').then(results => [
    `*Bocoupers out on ${moment().format('MMMM Do, YYYY')}:*`,
    results.map(o => `> ${o.bocouper}`),
  ]);
});
