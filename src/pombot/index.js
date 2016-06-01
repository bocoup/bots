import {RtmClient, WebClient, MemoryDataStore} from '@slack/client';
import {createSlackBot, createCommand, createArgsAdjuster} from 'chatter';
import config from '../../config';
import Pom from './pom';
import {times} from './pomConfig';

// define commands
import startCommand from './commands/start';
import stopCommand from './commands/stop';
import statusCommand from './commands/status';
import iwillCommand from './commands/iwill';

// create bot
const bot = createSlackBot({
  name: 'Pombot',
  icon: 'https://dl.dropboxusercontent.com/u/294332/Bocoup/bots/pombot_icon.png',
  verbose: true,
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
        this.postMessage(channel.id, `:tomato: warning – you have *${pom.getTimeString(pom.timeLeft)}* left in this pom!`);
      },
      onDoneCallback: () => {
        this.postMessage(channel.id, ':tomato: pom completed!');
        pom.stop();
      },
    });

    // Give command a name in public channels.
    const name = channel.is_im ? null : 'pom';
    // Helper method to format the given command name.
    const getCommand = cmd => name ? `${name} ${cmd}` : cmd;
    // The message handler.
    const messageHandler = createArgsAdjuster({
      // Inject pom instance and getCommand helper into message handler 2nd
      // (meta) argument.
      adjustArgs(message, meta) {
        meta.pom = pom;
        meta.getCommand = getCommand;
        return [message, meta];
      },
    }, createCommand({
      isParent: true,
      name,
      description: `:tomato: Hi, I'm pombot!`,
    }, [
      startCommand,
      stopCommand,
      statusCommand,
      iwillCommand,
    ]));
    // Indicate that the message handler has state so it gets cached.
    messageHandler.hasState = true;
    return messageHandler;
  },
});

export default bot;
