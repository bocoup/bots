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

export default createCommand({
  name: 'weekly',
  description: 'Show the weekly stats from the timesheet',
}, (msg, {bot, user}) => {
  return query('time_weekly', msg || '0 day')
    .then(logs =>
      '*Weekly Report for Hours:*\n' +
      logs.map(
        ({
          short_code: code,
          // first_week: start,
          // last_week: end,
          total_hours: total,
          avg_hours: avg,
          current_hours: current,
          target_hours: target,
          behind,
          ratio,
        }) =>
          `\`${code}${' '.repeat(10 - code.length)} [${histogramByPercentage(10, ratio)}\`${emoji(behind)}\`${histogramByPercentage(5, ratio - 1)}] ${`  ${Math.round(ratio * 100)}`.slice(-3)}% c:${duration(current)} t:${duration(target)} a:${duration(avg)}\`${emoji(target - avg)}`
      )
      .join('\n')
    );
});
