/*
 * A command to show the perch status of a Bocouper today.
 */
import Promise from 'bluebird';
import moment from 'moment';
import heredoc from 'heredoc-tag';
import {createCommand} from 'chatter';
import {query} from '../../lib/db';

function getPerching() {
  return query('perching').map(({bocouper, project = 'n/a'}) => `> ${bocouper} on ${project}`);
}

function getMetricText(who) {
  return query('perch_metric', who).get(0).then(metric => [
    `> You have used *${metric.count_weeks_you}* of *${metric.planned_weeks_you}* planned perch weeks this year.`,
    `> The company average for billable team members is *${metric.avg_weeks_all}* verified perch weeks this year.`,
    heredoc.oneline.trim`
      > We are *${metric.target_status}* our company-wide planned perch by
      *${metric.target_differential}* verified perch weeks this year.
    `,
    heredoc.oneline.trim`
      > *${metric.count_had_four_weeks}* out of *${metric.count_billable_today}*
      billable team members have had 4+ verified perch weeks this year.
    `,
    heredoc.oneline.trim`
      > You *${metric.billable_status}* currently coded as a billable team
      member. Please email hr@bocoup.com if this needs to be updated.
    `,
  ]);
}

export default createCommand({
  name: 'perch',
  description: 'Show information about perch',
}, (str, {user}) => {
  return Promise.all([
    getPerching(),
    getMetricText(user.name),
  ])
  .spread((perchingResponse, metricResponse) => [
    `> *Perch Status as of ${moment().format('MMMM Do, YYYY')}:*`,
    metricResponse,
    '>',
    `> *Bocoupers on Perch Today:*`,
    perchingResponse.length ? perchingResponse : '> none',
  ]);
});
