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
  const user = this.getUserByID(message.user);
  const channel = this.getChannelGroupOrDMByID(message.channel);
  const postMessage = text => channel.postMessage({
    username: 'Robocoup',
    text,
    unfurl_links: false,
    unfurl_media: false,
  });
  // Ignore non-im messages or non-message messages.
  if (!channel.is_im || message.type !== 'message') {
    return;
  }
  // If the message was a "changed" message, get the underlying message.
  if (message.subtype === 'message_changed') {
    message = message.message;
  }
  // Any message with a subtype or attachments can be safely ignored.
  if (message.subtype || message.attachments) {
    return;
  }

  // Flatten result array and remove `null` items, then join on newline.
  const normalizeResult = R.pipe(
    R.flatten,
    R.reject(R.isNil),
    R.join('\n')
  );
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
    return handler({channel, postMessage, command, user}, ...args);
  })
  .tap(() => log(message.text))
  .then(text => {
    if (Array.isArray(text)) {
      text = normalizeResult(text);
    }
    postMessage(text);
  })
  .catch(error => {
    postMessage(`An unexpected error occurred: \`${error.message}\``);
    console.error(error.stack);
  });
});

bot.on('error', function(error) {
  console.log('slack error', error);
});


export default bot;
