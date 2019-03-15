import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createConversation, createCommand} from 'chatter';
import mixinBotHelpers from '../lib/bot-helpers';
import config from '../../config';

import rememberCommand from './commands/remember';

const infobert = createSlackBot({
  name: 'Infobert',
  icon: 'https://avatars.slack-edge.com/2019-03-15/579990381894_df0fa93718f35153cd2b_192.jpg',
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.infobert, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.infobert),
    };
  },
  createMessageHandler(id, {bot, message, channel, user}) {
    if (message.text.startsWith('?')) {
      console.log(arguments);
      return () => 'wat';
    }
  },
});

// Mixin bot helpers.
mixinBotHelpers(infobert);

export default infobert;