/*
 * A command to show who is out today.
 */
import R from 'ramda';
import moment from 'moment';

import {query} from '../../lib/db';

export const usage = 'Show who is out:\n`Usage: out [today]`';

export function handler (meta, timeframe) {
  if (!timeframe) {
    return 'No timeframe specified.';
  }
  return query('out_today')
    .then(R.map(R.prop('bocouper')))
    .then(R.join('\n'))
    .then((who) => {
      return [
        `*Bocoupers out on ${moment().format('MMMM Do, YYYY')}*`, who
      ];
    });
}
