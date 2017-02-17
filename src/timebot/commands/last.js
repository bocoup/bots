import moment from 'moment';
import 'moment-duration-format';
import {query} from '../../lib/db';

import {createCommand} from 'chatter';

export default createCommand({
  name: 'last',
  description: 'Show the last 10 entries in the timesheet',
}, (msg, {bot, user}) => {
  return query('time_show_log', 10)
    .then(logs =>
      logs.map(
        ({ project, employee, duration, day, notes }) =>
          `${moment(day).format('MM-DD')}:timer_clock:${employee} ${moment.duration(duration).format('h[h]mm[m]')} [${project}] ${notes}`
      )
      .join('\n')
    )
});
