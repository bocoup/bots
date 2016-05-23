import config from '../../config';
import {createBot} from '../lib/bot';
import commands from './commands';

const bot = createBot('pombot', config.tokens.pombot);

bot.on('open', function() {
  console.log(`Connected to ${this.team.name} as @${this.self.name}`);
});

bot.on('message', function(message) {
  const channel = this.getChannelGroupOrDMByID(message.channel);
  if (channel.is_im && message.type === 'message' && !message.subtype) {
    channel.send(`You just said: ${message.text}`);
  }
});

bot.on('error', function(error) {
  console.log('slack error', error);
});

export default bot;
