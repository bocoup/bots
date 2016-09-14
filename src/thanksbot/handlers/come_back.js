/*
 * A command to enable thanksbot reminders.
 */
import {query} from '../../lib/db';

export default (message, {user, bot, slack}) => {
  if (message === 'come back') {
    return query('thanks_reminder_unmute', user.name).return(
      `I'm back. I'll send you a reminder again soon.`
    );
  }
  return false;
};
