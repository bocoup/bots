import Promise from 'bluebird';
import R from 'ramda';

import config from '../../config';
import {createBot} from '../lib/bot';
import {deparse} from '../lib/slack';
import commands from './commands';
import jobs from './jobs';

const bot = createBot('robocoup', config.robocoup);

bot.on('open', function() {
  console.log(`Connected to ${this.team.name} as @${this.self.name}`);
  if (config.runJobs) {
    jobs.start(bot);
  }
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
      return handler({command, user}, ...args);
    })
    .then(result => {
      if (Array.isArray(result)) {
        result = R.flatten(result).join('\n');
      }
      channel.send(result);
    })
    .catch(error => {
      channel.send(`An unexpected error occurred: \`${error.message}\``);
      console.error(error.stack);
    });
});

bot.on('error', function(error) {
  console.log('slack error', error);
});


export default bot;
