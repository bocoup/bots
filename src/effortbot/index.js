import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createConversation, createCommand} from 'chatter';
import config from '../../config';
import * as commands from './commands';

const bot = createSlackBot({
  name: 'Time Bot',
  icon: 'https://avatars.slack-edge.com/2016-01-07/17962262403_c150282ec5ef067ea5cc_512.png',
  verbose: true,
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.effortbot, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.effortbot),
    };
  },
  createMessageHandler(id, {channel}) {
    const root = createConversation([
      createCommand({
        isParent: true,
        icon: 'https://avatars.slack-edge.com/2016-01-07/17962262403_c150282ec5ef067ea5cc_512.png',
        description: `This bot records time clocks.`,
      }, [
        ...Object.keys(commands).map(key => commands[key]),
      ]),
    ]);

    if (channel.is_im) {
      return root;
    }
  },
});

export default bot;
