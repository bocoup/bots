import config from '../../config';
import {createBot} from '../lib/bot';
import {query} from '../lib/db';
import {deparse} from '../lib/slack';
import jobs from './jobs';

const bot = createBot('thanksbot', config.thanksbot);

bot.on('open', function() {
  console.log(`Connected to ${this.team.name} as @${this.self.name}`);
  if (config.runJobs) {
    jobs.start(bot);
  }
});

bot.on('message', function(message) {
  const channel = this.getChannelGroupOrDMByID(message.channel);
  const general = this.getChannelByName('general');
  const user = this.getUserByID(message.user);
  if (message.type === 'message' && channel.is_im) {
    if (message.subtype) {
      channel.send(`Sorry, I don't understand ${message.subtype} messages yet.`);
      return;
    }
    query('insert_thanks', user.name, deparse(this, message.text)).then(() => {
      channel.send('Thanks, your message has been recorded for next Monday :tada:');
      general.send('Someone just left a message!');
    });
  }
});

export default bot;
