import {createCommand} from 'chatter';

import {query} from '../../lib/db';
import {histogramByPercentage} from '../../lib/formatting';

const duration = time =>
  `${Number(time).toFixed(2)}h`;

// target - current is "positive" when current < target (which is a negative thing)
const emoji = val =>
  val > 0 ?
    ':exclamation:' :
    val < 0 ?
      ':white_check_mark:' :
      ':heavy_check_mark:';

const printLogLine = ({
  short_code: code,
  total_hours: total,
  avg_hours: average,
  current_hours: current,
  target_hours: target,
  behind,
  ratio,
}) => {
  // use short variables to make the template be one line
  const cd = `${code}${' '.repeat(10 - code.length)}`;
  const lbar = histogramByPercentage(10, ratio);
  const mbar = emoji(behind);
  const rbar = histogramByPercentage(5, ratio - 1);
  const pct = `  ${Math.round(ratio * 100)}`.slice(-3);
  const cur = duration(current);
  const tar = duration(target);
  const avg = duration(average);
  const amoj = emoji(target - average);
  return `\`${cd} [${lbar}\`${mbar}\`${rbar}] ${pct}% c:${cur} t:${tar} a:${avg}\`${amoj}`;
};

export default createCommand({
  name: 'weekly',
  description: 'Show the weekly stats from the timesheet',
}, (msg, {bot, user}) => {
  return query('time_weekly', msg || '0 day')
    .then(logs =>
      '*Weekly Report for Hours:*\n' +
      logs.map(printLogLine)
        .join('\n')
    );
});
