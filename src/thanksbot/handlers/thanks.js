/*
 * A command to record thanks in thanksbot.
 */

import {query} from '../../lib/db';

export default (message, {user, bot, slack}) => {
  const channelName = 'general';
  const channel = slack.rtmClient.dataStore.getChannelByName(channelName).id;
  return query('insert_thanks', user.name, bot.parseMessage(message))
    .then(() => bot.sendResponse({channel}, 'Someone just left a message!'))
    .then(() => 'Thanks, your message has been recorded for next Monday :tada:');
};
