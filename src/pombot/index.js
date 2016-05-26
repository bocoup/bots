import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createCommand} from 'chatter';
import config from '../../config';
import Pom from './pom';

// define commands
import getStartCommand from './commands/start';
import getStopCommand from './commands/stop';
import getIwillCommand from './commands/iwill';
import getStatusCommand from './commands/status';

// create bot
const bot = createSlackBot({
  name: 'Pombot',
  getSlack() {
    return {
      rtmClient: new RtmClient(config.tokens.pombot, {
        dataStore: new MemoryDataStore(),
        autoReconnect: true,
      }),
      webClient: new WebClient(config.tokens.pombot),
    };
  },
  createMessageHandler(id, {channel}) {
    // create the pom for this message
    const pom = new Pom({
      maxMinutes: 1,
      warningMinutes: 0.5,
      onWarningCallback: () => {
        this.sendResponse({channel: channel.id}, `warning: there are *${pom.getMinutes(pom.timeLeft)}* minutes left in this pom!`);
      },
      onDoneCallback: () => {
        this.sendResponse({channel: channel.id}, 'pom completed!');
        pom.stop();
      },
    });

    // Direct message
    if (channel.is_im) {
      // im message handler
      const messageHandler = createCommand({
        isParent: true,
        description: `Hi, I'm pombot!`,
      }, [
        getStartCommand(pom),
        getStopCommand(pom),
        getIwillCommand,
        getStatusCommand,
      ]);
      messageHandler.hasState = true;
      return messageHandler;
    }

    // Public channel message handler
    const messageHandler = createCommand({
      name: 'pom',
      isParent: true,
      description: `Hi, I'm pombot!`,
    }, [
      getStartCommand(pom),
      getStopCommand(pom),
      getIwillCommand,
      getStatusCommand,
    ]);
    messageHandler.hasState = true;
    return messageHandler;

  },
});

export default bot;
