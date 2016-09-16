import {createCommand} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'leave me alone',
  description: 'Turn off randomized daily reminders.',
}, (message, {user}) => {
  return query('thanks_reminder_mute', user.name).return(
    'Okay. If you change your mind, just send `/dm thanksbot come back`'
  );
});
