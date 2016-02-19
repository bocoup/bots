import R from 'ramda';

import config from '../../config';
import {createBot} from '../lib/bot';
import {deparse} from '../lib/slack';
import {db} from '../lib/db';
import Conversation from '../lib/conversation';
import commands from './commands';
import jobs from './jobs';

const bot = createBot('robocoup', config.robocoup);

const conversations = {};

function getConversation({id}, fn) {
  if (!conversations[id]) {
    conversations[id] = new Conversation();
  }
  return conversations[id];
}

function log(command) {
  return db('bot_log').insert({
    bot: 'robocoup',
    command,
  }).then();
}

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

  const user = this.getUserByID(message.user);
  getConversation(channel).handleMessage({message, user}, () => {
    // Parse command and args out of message.
    const args = deparse(this, message.text).split(' ');
    const command = args.shift();
    // Is there a handler registered for this command?
    const handler = commands[command] && commands[command].handler;
    if (!handler) {
      return `Unknown command \`${command}\`.`;
    }
    // Run the command!
    return handler({channel, command, user}, ...args);
  })
  .tap(() => log(message.text))
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
