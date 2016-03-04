import R from 'ramda';

import config from '../../config';
import {createBot} from '../lib/bot';
import {deparse} from '../lib/slack';
import {db} from '../lib/db';
import Conversation from '../lib/bot/conversation';
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

function getPostMessage({channel, botname}) {
  // Flatten result array and remove null, undefined or false items, then
  // join on newline.
  const normalizeResult = R.pipe(
    R.flatten,
    R.reject(s => R.isNil(s) || s === false),
    R.join('\n')
  );
  // Return a function that normalizes result (if necessary) and posts
  // a message to the given channel as the bot.
  return text => {
    if (Array.isArray(text)) {
      text = normalizeResult(text);
    }
    if (!text) {
      return Promise.resolve();
    }
    // Return a promise that resolves when channel.postMessage gets a response.
    // I have no idea why it doesn't just do this!
    return new Promise((resolve, reject) => {
      // Override the built-in method that gets called on postMessage response.
      channel._onPostMessage = data => {
        // Remove the override, and call the original method.
        delete channel._onPostMessage;
        channel._onPostMessage(data);
        // Resolve or reject as-appropriate.
        if (data.ok) {
          resolve(data);
        }
        else {
          reject(data);
        }
      };
      channel.postMessage({
        username: botname,
        text,
        unfurl_links: false,
        unfurl_media: false,
      });
    });
  };
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
  // Any message with a subtype or attachments can be safely ignored.
  if (message.subtype || message.attachments) {
    return;
  }
  const user = this.getUserByID(message.user);

  const postMessage = getPostMessage({channel, botname: 'Robocoup'});
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
  .then(postMessage)
  .catch(error => {
    postMessage(`An unexpected error occurred: \`${error.message}\``);
    console.error(error.stack);
  });
});

bot.on('error', function(error) {
  console.log('slack error', error);
});


export default bot;
