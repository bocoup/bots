/*
 * A command to show the utilization status of the company today.
 */
import R from 'ramda'
import moment from 'moment';

import {query} from '../../lib/db';

export const usage =
  'Show information about our sales pipeline:\n`Usage: pipeline`';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const targets = {
  "2016": [2500000,2500000,2500000,2500000]
};

// todo add a sync for this to the integrations repo
const stages = [
  'Stalled',
  'Initial Outbound',
  'Initial Contact',
  'New Deal',
  'Defining Scope',
  'Defining Terms',
  'Procurement'
];

export function handler (meta) {
  return query('sales_pipeline')
    .then((results) => {
      const year = moment().format('YYYY');
      const quarter = moment().format('Q');
      const target = targets[year][parseInt(quarter)];
      const actual = R.sum(R.map(parseInt)(R.pluck('value')(results)));
      const differential = Math.round(actual/target*100);
      return [
        `> *Sales Pipeline Status as of 12AM on ${moment().format('MMMM Do, YYYY')}*`,
        `> The weighted value of our sales pipeline is currently ​*${currency.format(actual)}​*.`,
        `> We are at *${differential}%* of our ongoing goal of *${currency.format(target)}* for *Q${quarter}* of *${year}*.`,
        `>`
      ].concat(results.map((metric) => {
        const stage = stages[parseInt(metric.stage)-1]
        const dealText = metric.deals === 1 ? 'deal' : 'deals';
        return `> We have *${metric.deals}* ${dealText} in *${stage}* for a weighted value of *${currency.format(metric.value)}*.`
      }));
    });
}
