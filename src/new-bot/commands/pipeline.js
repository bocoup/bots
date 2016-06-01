/*
 * A command to show the utilization status of the company today.
 */
import R from 'ramda';
import moment from 'moment';
import heredoc from 'heredoc-tag';
import {createCommand} from 'chatter';
import {query} from '../../lib/db';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const targets = {
  2016: [2500000, 2500000, 2500000, 2500000],
};

// todo add a sync for this to the integrations repo
const stages = [
  'Stalled',
  'Initial Outbound',
  'Initial Contact',
  'New Deal',
  'Defining Scope',
  'Defining Terms',
  'Procurement',
];

export default createCommand({
  name: 'pipeline',
  description: 'Show information about our sales pipeline.',
}, () => {
  return query('sales_pipeline').then(metrics => {
    const year = moment().format('YYYY');
    const quarter = moment().format('Q');
    const target = targets[year][quarter];
    const actual = R.sum(R.map(Number)(R.pluck('value')(metrics)));
    const differential = Math.round(actual / target * 100);
    const createdAt = moment.unix(metrics[0].created_at).tz('America/New_York');
    const time = createdAt.format('hA');
    const day = createdAt.format('MMMM Do, YYYY');
    return [
      `> *Sales Pipeline Status as of ${time} (EST) on ${day}:*`,
      `> The weighted value of our sales pipeline is currently *${currency.format(actual)}*.`,
      heredoc.oneline.trim`
        > We are at *${differential}%* of our ongoing goal of *${currency.format(target)}*
        for *Q${quarter}* of *${year}*.
      `,
      `>`,
      ...metrics.map(metric => {
        const stage = stages[metric.stage - 1];
        const dealText = Number(metric.deals) === 1 ? 'deal' : 'deals';
        return heredoc.oneline.trim`
          > We have *${metric.deals}* ${dealText} in *${stage}* for a weighted
          value of *${currency.format(metric.value)}*.
        `;
      }),
    ];
  });
});
