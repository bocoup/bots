/*
 * A command to disable thanksbot reminders.
 */
import {query} from '../../lib/db';

export default (message, {user, bot, slack}) => {
  if (message === 'leave me alone') {
    return query('thanks_reminder_mute', user.name).return(
      'Okay. If you change your mind, just send `/dm thanksbot come back`'
    );
  }
  return false;
};
