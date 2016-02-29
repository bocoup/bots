/*
 * A command to show the utilization status of the company today.
 */
import R from 'ramda'
import moment from 'moment';

import {query} from '../../lib/db';

export const usage =
  'Show information about our utilization rate:\n`Usage: utilization`';

export function handler (meta) {
  return query('utilization_metric')
    .get(0)
    .then((metric) => {
      return [
        `> *Utilization Status as of ${moment().format('MMMM Do, YYYY')}*`,
        `> During the *last 30 days* our utilization rate was *${metric.last_30_days}%*.`,
        `> During the *next 30 days* our utilization rate is currently scheduled to be *${metric.next_30_days}%*.`,
        `> Year to date, our utilization rate has been *${metric.ytd}%*.`,
        `> Our utilization goal is *80%* of our *${metric.billable_count}* billable team members on billable B2B projects.`
      ];
    });
}
