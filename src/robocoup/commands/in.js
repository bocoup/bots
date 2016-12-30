/*
 * A command to show who is in today.
 */
import moment from 'moment';
import {createCommand} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'in',
  description: 'Show who is in today.',
}, () => {
  return query('in_today').then(results => [
    `*Bocoupers in on ${moment().format('MMMM Do, YYYY')}:*`,
    results.map(o => `> ${o.bocouper}`),
  ]);
});
