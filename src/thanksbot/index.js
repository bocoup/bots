import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot} from 'chatter';
import config from '../../config';
import {query} from '../lib/db';
import jobs from './jobs';

const messageHandler = (message, {user, bot, slack}) => {
  const channelName = 'general';
  const channel = slack.rtmClient.dataStore.getChannelByName(channelName).id;
  return query('insert_thanks', user.name, bot.parseMessage(message))
    .then(() => bot.sendResponse({channel}, 'Someone just left a message!'))
    .then(() => 'Thanks, your message has been recorded for next Monday :tada:');
};

const bot = createSlackBot({
  name: 'Thanksbot',
  icon: 'https://avatars.slack-edge.com/2016-01-07/17962262403_c150282ec5ef067ea5cc_512.png',
  verbose: true,
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.thanksbot, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.thanksbot),
    };
  },
  createMessageHandler(id, {channel}) {
    // Direct message
    if (channel.is_im) {
      return [
        messageHandler,
      ];
    }
  },
});

if (config.runJobs) {
  jobs.start(bot);
}

export default bot;
