import {query} from '../../lib/db';

import {createCommand} from 'chatter';

const duration = time =>
  `${Number(time).toFixed(2)}h`;

export default createCommand({
  name: 'weekly',
  description: 'Show the weekly stats from the timesheet',
}, (msg, {bot, user}) => {
  return query('time_weekly')
    .then(logs =>
      logs.map(
        ({
          short_code: code,
          // first_week: start,
          // last_week: end,
          total_hours: total,
          avg_hours: avg,
          current_hours: current,
          behind,
        }) =>
          `${duration(current)} [${code}]: ${behind > 0 ?
            `:exclamation: ${duration(behind)} behind` :
            behind < 0 ?
            `:white_check_mark: ${duration(-behind)} ahead` :
            ':heavy_check_mark:'
          } the average of ${duration(avg)} per week.`
      )
      .join('\n')
    );
});
