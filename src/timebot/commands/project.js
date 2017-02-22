import {query} from '../../lib/db';

import {createCommand} from 'chatter';

const duration = time =>
  `${Number(time).toFixed(2)}h`;

export default createCommand({
  name: 'project',
  description: 'Show the weekly stats from the timesheet for the project',
}, (msg, {bot, user}) => {
  if (!msg) {
    return 'You must specify a project, try *projects* to see a list';
  }
  return query('time_history', msg)
    .then(logs =>
      logs.map(
        ({
          short_code: code,
          week,
          hours,
          notes,
        }) =>
          `:timer_clock: [${code}] ${week} ${duration(hours)} \n> ${notes}`
      )
      .join('\n')
    );
});
