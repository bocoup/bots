import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createCommand} from 'chatter';
import config from '../../config';
import jobs from './jobs';

import recordCommand from './commands/record';
import helperCommand from './commands/helper';

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
    if (channel.is_im) {
      return createCommand({
        isParent: true,
        icon: 'https://avatars.slack-edge.com/2016-01-07/17962262403_c150282ec5ef067ea5cc_512.png',
        description: `This bot records thanks and shares them with the coop every Monday.`,
      }, [
        recordCommand,
        helperCommand,
      ]);
    }
  },
});

if (config.runJobs) {
  jobs.start(bot);
}

export default bot;
