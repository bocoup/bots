import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createConversation, createCommand} from 'chatter';
import config from '../../config';

import expertiseCommand from './commands/expertise';
import outCommand from './commands/out';
import perchCommand from './commands/perch';
import pipelineCommand from './commands/pipeline';
import statusCommand from './commands/status';
import utilizationCommand from './commands/utilization';
import versionCommand from './commands/version';

const lolHandler = message => {
  if (/lol/i.test(message)) {
    const newMessage = message.replace(/lol/ig, 'laugh out loud');
    return `More like "${newMessage}" amirite`;
  }
  return false;
};

const bot = createSlackBot({
  name: 'Robocoup Mk. II',
  slack: {
    rtmClient: new RtmClient(config.tokens.newbot, {
      dataStore: new MemoryDataStore(),
      autoReconnect: true,
    }),
    webClient: new WebClient(config.tokens.newbot),
  },
  createMessageHandler() {
    return createConversation([
      this.createSlackMessageHandler({dm: true}, [
        lolHandler,
        createCommand({
          isParent: true,
          description: `Dead or alive, you're coming with me.`,
        }, [
          expertiseCommand,
          outCommand,
          perchCommand,
          pipelineCommand,
          statusCommand,
          utilizationCommand,
          versionCommand,
        ]),
      ]),
      this.createSlackMessageHandler({channel: true}, [
        lolHandler,
      ]),
    ]);
  },
});

export default bot;
