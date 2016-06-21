/*
 * A command to show the utilization status of the company and yourself today.
 */
import Promise from 'bluebird';
import moment from 'moment';
import R from 'ramda';
import {createCommand} from 'chatter';
import {query} from '../../lib/db';
import {histogramByPercentage} from '../../lib/formatting';

// filtering functions
const isFuture = R.propEq('timeframe', 'future');
const isPast = R.propEq('timeframe', 'past');
const isBillable = R.propEq('is_billable', true);
const isNonBillable = R.propEq('is_billable', false);
const hasNoDays = R.pipe(R.prop('total'), R.equals(0));
const hasDays = R.pipe(hasNoDays, R.not);
const getTotal = R.pipe(R.map(R.prop('total')), R.sum);

// date ranges
const firstOfYear = moment().startOf('year').format('YYYY-MM-DD');
const today = moment().startOf('today').format('YYYY-MM-DD');
const firstDay = moment().startOf('today').subtract(6, 'months').format('YYYY-MM-DD');
const lastDay = moment().startOf('today').add(6, 'months').format('YYYY-MM-DD');

const BAR_WIDTH = 10;

function percentBar(percentage, title) {
  const bar = histogramByPercentage(BAR_WIDTH, percentage);
  const displayPercentage = `  ${Math.round(percentage * 100)}`.slice(-3);
  return `\`${bar} ${displayPercentage}%\` ${title}`;
}

function dayCountBar(max, count, title) {
  const percentage = count / max;
  const dayText = `day${count === 1 ? '' : 's'}`;
  return percentBar(percentage, `${title} (*${count} ${dayText}*)`);
}

export default createCommand({
  name: 'utilization',
  description: 'Show information about our utilization rate.',
}, (message, meta) => {

  const user = meta.user.name;

  const qCompany = query('utilization_metric').then().get(0);

  const qMyYtd = query(
    'utilization_metric_by_bocouper',
    firstOfYear,
    today,
    user
  );

  const qMyYearWindow = query(
    'utilization_metric_by_bocouper',
    firstDay,
    lastDay,
    user
  );

  const qDaysPast = query(
    'days_in_range',
    firstDay,
    today
  ).get(0).get('count');

  const qDaysFuture = query(
    'days_in_range',
    today,
    lastDay
  ).get(0).get('count');

  const qDaysYtd = query(
    'days_in_range',
    firstOfYear,
    today
  ).get(0).get('count');

  const queries = [
    qCompany,
    qMyYtd,
    qMyYearWindow,
    qDaysPast,
    qDaysFuture,
    qDaysYtd,
  ];

  return Promise.all(queries).spread((company, myYtd, myYearWindow, countDaysPast, countDaysFuture, countDaysYtd) => {

    const pastBar = R.partial(dayCountBar, [countDaysPast]);
    const futureBar = R.partial(dayCountBar, [countDaysFuture]);
    const ytdBar = R.partial(dayCountBar, [countDaysYtd]);

    const past = R.filter(isPast)(myYearWindow);
    const future = R.filter(isFuture)(myYearWindow);

    const companyMetrics = [
      `*Bocoup Utilization Status*`,
      `> ${percentBar(company.last_30_days, 'Last 30 Days')}`,
      `> ${percentBar(company.next_30_days, 'Next 30 Days _(as currently scheduled)_')}`,
      `> ${percentBar(company.last_365_days, 'Last 365 Days')}`,
      `> ${percentBar(company.ytd, `${moment().year()} to Date`)}`,
      `> _Our goal is always *80%* of our *${company.billable_count}* billable team members utilized on billable B2B projects._`,
    ];

    // calculate team member utilization year to date
    const billableYtd = R.filter(isBillable)(myYtd);
    const billableYtdUsage = R.filter(hasDays)(billableYtd);
    const nonBillableYtd = R.filter(isNonBillable)(myYtd);
    const nonBillableYtdUsage = R.filter(hasDays)(nonBillableYtd);
    const unscheduledYtd = countDaysYtd - getTotal(myYtd);
    const myYtdMetrics = [
      `*My Utilization Status: ${moment().year()} To Date*`,
    ];
    if (unscheduledYtd > 0) {
      myYtdMetrics.push(`> ${ytdBar(unscheduledYtd, 'Unscheduled')}`);
    }
    myYtdMetrics.push([
      `> ${ytdBar(getTotal(billableYtd), 'Billable')}`,
      billableYtdUsage.map(metric => `>╰ ${ytdBar(metric.total, metric.name)}`),
      `> ${ytdBar(getTotal(nonBillableYtd), 'Non-Billable')}`,
      nonBillableYtdUsage.map(metric => `>╰ ${ytdBar(metric.total, metric.name)}`),
    ]);

    // calculate team member utilization for the last six months
    const billablePast = R.filter(isBillable)(past);
    const billablePastUsage = R.filter(hasDays)(billablePast);
    const nonBillablePast = R.filter(isNonBillable)(past);
    const nonBillablePastUsage = R.filter(hasDays)(nonBillablePast);
    const unscheduledPast = countDaysPast - getTotal(past);
    const myPastMetrics = [
      `*My Utilization Status: Last Six Months*`,
    ];
    if (unscheduledPast > 0) {
      myPastMetrics.push(`> ${futureBar(unscheduledPast, 'Unscheduled')}`);
    }
    myPastMetrics.push([
      `> ${pastBar(getTotal(billablePast), 'Billable')}`,
      billablePastUsage.map(metric => `>╰ ${pastBar(metric.total, metric.name)}`),
      `> ${pastBar(getTotal(nonBillablePast), 'Non-Billable')}`,
      nonBillablePastUsage.map(metric => `>╰ ${pastBar(metric.total, metric.name)}`),
    ]);

    // calculate team member utilization for the next six months
    const billableFuture = R.filter(isBillable)(future);
    const billableFutureUsage = R.filter(hasDays)(billableFuture);
    const nonBillableFuture = R.filter(isNonBillable)(future);
    const nonBillableFutureUsage = R.filter(hasDays)(nonBillableFuture);
    const unscheduledFuture = countDaysFuture - getTotal(future);
    const myFutureMetrics = [
      `*My Utilization Status: Next Six Months* _(as currently scheduled)_`,
    ];
    if (unscheduledFuture > 0) {
      myFutureMetrics.push(`> ${futureBar(unscheduledFuture, 'Unscheduled')}`);
    }
    myFutureMetrics.push([
      `> ${futureBar(getTotal(billableFuture), 'Billable')}`,
      billableFutureUsage.map(metric => `>╰ ${futureBar(metric.total, metric.name)}`),
      `> ${futureBar(getTotal(nonBillableFuture), 'Non-Billable')}`,
      nonBillableFutureUsage.map(metric => `>╰ ${futureBar(metric.total, metric.name)}`),
    ]);

    // calculate which utilization/leave types are possible
    const types = R.uniq(R.map(R.prop('name'))(myYearWindow));
    // calculate which utilizations/leave types a team member has used
    const nonEmptyTypes = R.uniq(R.concat(
      R.map(R.prop('name'))(R.filter(hasDays)(myYearWindow)),
      R.map(R.prop('name'))(R.filter(hasDays)(myYtd))
    ));
    // calculate which utilization/leave types haven't been used
    const unusedTypes = R.difference(types, nonEmptyTypes).sort();
    const myUtilizationTypesNotUsed = [
      `*You have no utilizations for the following types:*`,
      `> ${unusedTypes.join(', ')}`,
    ];

    const resources = [
      `*Resources*`,
      `> <https://github.com/bocoup/bocoup-meta/wiki/Policies#time-off|Time Off Policy>`,
      `> <https://away.bocoup.com|Make a Time Off Request>`,
    ];

    return [
      companyMetrics,
      '',
      myYtdMetrics,
      '',
      myPastMetrics,
      '',
      myFutureMetrics,
      '',
      myUtilizationTypesNotUsed,
      '',
      resources,
    ];
  });

});
