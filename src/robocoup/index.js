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
  // Ignore non-im messages or non-message messages.
  if (!channel.is_im || message.type !== 'message') {
    return;
  }
  // If the message was a "changed" message, get the underlying message.
  if (message.subtype === 'message_changed') {
    message = message.message;
  }
  // Any message with a subtype can be safely ignored.
  if (message.subtype) {
    return;
  }
  // Parse command and args out of message.
  const args = deparse(this, message.text).split(' ');
  const command = args.shift();
  const action = args.length > 0 ? args.join(' ') : null;
  // Is there a handler registered for this command?
  const handler = commands[command] && commands[command].handler;
  if (!handler) {
    channel.send(`Unknown command \`${command}\`.`);
    return;
  }
  // Run the command!
  Promise
    .try(() => {
      const user = this.getUserByID(message.user);
      return handler(user, action);
    })
    .then(channel.send.bind(channel))
    .catch(error => {
      channel.send(`An unexpected error occurred: \`${error.message}\``);
    });
});

export default bot;
