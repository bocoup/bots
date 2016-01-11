const bPromise = require('bluebird');
const Slack = require('slack-client');

const config = require('../../config')
const slack = require('../lib/slack');
const commands = require('./commands');
const key = require('../lib/token').get(config, 'robocoup');

const Bot = new Slack(key, true, true);

Bot.on('open', function() {
  console.log('Connected to %s as @%s', this.team.name, this.self.name);
});

Bot.on('message', function(message) {
  const channel = this.getChannelGroupOrDMByID(message.channel);
  const user = this.getUserByID(message.user);
  const subtype = message.subtype || 'normal';
  if (message.type === 'message' && !message.subtype && channel.is_im) {
    const input = slack.deparse.call(this, message.text).split(' ');
    const command = input[0];
    const action = input.slice(1).join(' ');
    const handler = commands[command] && commands[command].handler;
    if (handler) {
      bPromise.resolve(handler(user, action === '' ? null : action))
        .then(channel.send.bind(channel), function (error) {
          channel.send('Error: '+error.message);
        });
    } else {
      channel.send('Unknown command `'+command+'`.');
    }
  }
});

module.exports = Bot;
