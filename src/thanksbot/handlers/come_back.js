import {createCommand} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'come back',
  description: 'Turn on randomized daily reminders.',
}, (message, {user, bot, slack}) => {
  return query('thanks_reminder_unmute', user.name).return(
    `I'm back. I'll send you a reminder again soon.`
  );
});
