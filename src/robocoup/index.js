const bPromise = require('bluebird');
const Slack = require('slack-client');

const config = require('../../config')
const slack = require('../lib/slack');
const commands = require('./commands');
const key = require('../lib/token').get(config, 'robocoup');

const Bot = new Slack(key, true, true);

Bot.on('open', function() {
  const channels = Object.keys(this.channels)
    .map(function (k) { return this.channels[k]; }.bind(this))
    .filter(function (c) { return c.is_member; })
    .map(function (c) { return c.name; });

  const groups = Object.keys(this.groups)
    .map(function (k) { return this.groups[k]; })
    .filter(function (g) { return g.is_open && !g.is_archived; })
    .map(function (g) { return g.name; });

  const listening = channels.concat(groups);
  console.log(this.self.name+' is listening '+(listening.length ? 'in '+listening.join(', ') : ''));
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
