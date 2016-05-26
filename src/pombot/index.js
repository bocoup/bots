import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createCommand} from 'chatter';
import config from '../../config';
import Pom from './pom';
import {times} from './pomConfig';

// define commands
import getStartCommand from './commands/start';
import getStopCommand from './commands/stop';
import getStatusCommand from './commands/status';
import getIwillCommand from './commands/iwill';

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
      maxMinutes: times.maxMinutes,
      warningMinutes: times.warningMinutes,
      onWarningCallback: () => {
        this.sendResponse({channel: channel.id}, `🍅 warning – there are *${pom.getTimeString(pom.timeLeft)}* left in this pom!`);
      },
      onDoneCallback: () => {
        this.sendResponse({channel: channel.id}, '🍅 pom completed!');
        pom.stop();
      },
    });

    // Direct message
    if (channel.is_im) {
      // im message handler
      const messageHandler = createCommand({
        isParent: true,
        description: `🍅 Hi, I'm pombot!`,
      }, [
        getStartCommand(pom),
        getStopCommand(pom),
        getStatusCommand(pom),
        getIwillCommand(pom, this),
      ]);
      messageHandler.hasState = true;
      return messageHandler;
    }

    // Public channel message handler
    const messageHandler = createCommand({
      name: 'pom',
      isParent: true,
      description: `🍅 Hi, I'm pombot!`,
    }, [
      getStartCommand(pom),
      getStopCommand(pom),
      getStatusCommand(pom),
      getIwillCommand(pom),
    ]);
    messageHandler.hasState = true;
    return messageHandler;

  },
});

export default bot;
