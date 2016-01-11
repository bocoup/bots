import Promise from 'bluebird';
import Slack from 'slack-client';

import config from '../../config';
import {deparse} from '../lib/slack';
import commands from './commands';

import {get as getToken} from '../lib/token';
const key = getToken(config, 'robocoup');

const bot = new Slack(key, true, true);

bot.on('open', function() {
  console.log(`Connected to ${this.team.name} as @${this.self.name}`);
});

bot.on('message', function(message) {
  const channel = this.getChannelGroupOrDMByID(message.channel);
  const user = this.getUserByID(message.user);
  const subtype = message.subtype || 'normal';
  if (message.type === 'message' && !message.subtype && channel.is_im) {
    const input = deparse.call(this, message.text).split(' ');
    const command = input[0];
    const action = input.slice(1).join(' ');
    const handler = commands[command] && commands[command].handler;
    if (!handler) {
      channel.send(`Unknown command \`${command}\`.`);
      return;
    }
    Promise
      .try(() => {
        return handler(user, action === '' ? null : action);
      })
      .then(channel.send.bind(channel))
      .catch(error => {
        channel.send(`An unexpected error occurred: \`${error.message}\``);
      });
  }
});

export default bot;
