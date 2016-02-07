/*
 * A command to show the perch status of a Bocouper today.
 */
import R from 'ramda'
import Promise from 'bluebird';
import moment from 'moment';

import {query} from '../../lib/db';

export const usage =
  'Show information about perch:\n`Usage: perch`';

function perchers() {
  return query('perching').map((percher) => {
    return `> ${percher.bocouper} on ${percher.project||'n/a'}`;
  });
}

function metric(who) {
  return query('perch_metric', who)
    .get(0)
    .then((metric) => {
      return [
        `> You have used *${metric.count_weeks_you}* of *${metric.planned_weeks_you}* planned perch weeks this year.`,
        `> The company average for billable team members is *${metric.avg_weeks_all}* verified perch weeks this year.`,
        `> We are *${metric.target_status}* our company-wide planned perch by *${metric.target_differential}* verified perch weeks this year.`,
        `> *${metric.count_had_four_weeks}* out of *${metric.count_billable_today}* billable team members have had 4+ verified perch weeks this year.`,
        `> You *${metric.billable_status}* currently coded as a billable team member. Please email hr@bocoup.com if this needs to be updated.`
      ];
    });
}

export function handler (meta) {
  return Promise.all([perchers(), metric(meta.user.name)])
    .spread(function (perchingResponse, metricResponse) {
      return R.flatten([
        `> *Perch Status as of ${moment().format('MMMM Do, YYYY')}*`,
        metricResponse,
        '>',
        `> *Bocoupers on Perch Today:*`,
        perchingResponse.length ? perchingResponse : '> none',
      ]);
    });
}
