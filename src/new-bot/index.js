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

const bot = createSlackBot({
  name: 'Robocoup Mk. II',
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.newbot, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.newbot),
    };
  },
  createMessageHandler(id, {channel}) {
    // Direct message
    if (channel.is_im) {
      return createConversation([
        // Nameless command that encapsulates sub-commands and adds a "help"
        // command and a fallback message handler.
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
      ]);
    }
  },
});

export default bot;
