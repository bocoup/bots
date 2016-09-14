import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot} from 'chatter';
import config from '../../config';
import jobs from './jobs';

import leaveMeAloneHandler from './handlers/leave_me_alone';
import comeBackHandler from './handlers/come_back';
import thanksHandler from './handlers/thanks';

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
        leaveMeAloneHandler,
        comeBackHandler,
        thanksHandler,
      ];
    }
  },
});

if (config.runJobs) {
  jobs.start(bot);
}

export default bot;
