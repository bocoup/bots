import {createCommand} from 'chatter';
import {query} from '../../lib/db';

export default createCommand({
  name: 'thanks',
  description: 'Leave a message in the weekly thanksbot digest.',
  usage: 'thanks [message]',
}, (message, {bot, user}) => {
  if (!message) {
    return `What message would you like to record?`;
  }
  const channelName = 'general';
  const channel = bot.slack.rtmClient.dataStore.getChannelByName(channelName).id;
  return query('insert_thanks', user.name, bot.parseMessage(message))
    .then(() => bot.sendResponse({channel}, 'Someone just left a message!'))
    .then(() => 'Thanks, your message has been recorded for next Monday :tada:');
});
