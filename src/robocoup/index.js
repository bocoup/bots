import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createConversation, createCommand} from 'chatter';
import mixinBotHelpers from '../lib/bot-helpers';
import config from '../../config';

import outCommand from './commands/out';
import inCommand from './commands/in';
import versionCommand from './commands/version';

const bot = createSlackBot({
  name: 'Robocoup Mk. II',
  icon: 'https://dl.dropboxusercontent.com/u/294332/Bocoup/bots/robocoup_icon.png',
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.robocoup, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.robocoup),
    };
  },
  createMessageHandler(id, {channel}) {
    // Direct message
    if (channel.is_im) {
      // Wrapping the command in a conversation allows the bot to be aware of
      // when a command returns a "dialog".
      return createConversation([
        // Nameless command that encapsulates sub-commands and adds a "help"
        // command and a fallback message handler.
        createCommand({
          isParent: true,
          description: `Dead or alive, you're coming with me.`,
        }, [
          outCommand,
          inCommand,
          versionCommand,
        ]),
      ]);
    }
  },
});

// Mixin bot helpers.
mixinBotHelpers(bot);

export default bot;
