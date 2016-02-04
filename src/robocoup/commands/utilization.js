/*
 * A command to show the utilization status of the company today.
 */
import R from 'ramda'
import Promise from 'bluebird';
import moment from 'moment';

import {query} from '../../lib/db';

export const usage =
  'Show information about our utilization rate:\n`Usage: utilization`';

export function handler (meta) {
  return query('utilization_metric')
    .get(0)
    .then((metric) => {
      return [
        `> During the *last 30 days* our *${metric.billable_count}* billable team members were utilized at rate of *${metric.last_30_days}%* on billable B2B customer projects. Our goal is *80%*.`,
        `> We are scheduled to be utilized at *${metric.next_30_days}%* in the *next 30 days.*`,
        `> We have been utilized on billable projects at *%* so far this year.`
      ];
    });
}
