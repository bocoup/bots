/*
 * A command to show the utilization status of the company today.
 */
import moment from 'moment';
import {createCommand} from 'chatter';
import {query} from '../../lib/db';
import heredoc from 'heredoc-tag';

export default createCommand({
  name: 'utilization',
  description: 'Show information about our utilization rate.',
}, () => {
  return query('utilization_metric').get(0).then(metric => {
    return [
      `> *Utilization Status as of ${moment().format('MMMM Do, YYYY')}*`,
      `> During the *last 30 days* our utilization rate was *${metric.last_30_days}%*.`,
      `> During the *next 30 days* our utilization rate is currently scheduled to be *${metric.next_30_days}%*.`,
      `> Year to date, our utilization rate has been *${metric.ytd}%*.`,
      heredoc.oneline.trim`
        > Our utilization goal is *80%* of our *${metric.billable_count}* billable team members
        on billable B2B projects.
      `,
    ];
  });
});
