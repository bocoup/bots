import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createCommand} from 'chatter';
import config from '../../config';
import * as commands from './commands'

const bot = createSlackBot({
  name: 'Time Bot',
  icon: 'https://avatars.slack-edge.com/2016-01-07/17962262403_c150282ec5ef067ea5cc_512.png',
  verbose: true,
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.timebot, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.timebot),
    };
  },
  createMessageHandler(id, {channel}) {
    const root = createCommand({
      isParent: true,
      icon: 'https://avatars.slack-edge.com/2016-01-07/17962262403_c150282ec5ef067ea5cc_512.png',
      description: `This bot records time clocks.`,
    }, [
      ...Object.keys(commands).map(key => commands[key]),
    ]);

    if (channel.is_im) {
      return root
    }

    console.log(channel)

  },
});

export default bot;
