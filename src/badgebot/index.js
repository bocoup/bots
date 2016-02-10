import config from '../../config';
import {createBot} from '../lib/bot';

const badgebot = createBot('badgebot', config.badgebot);

badgebot.on('open', function() {
  console.log(`Connected to ${this.team.name} as @${this.self.name}`);
});

badgebot.on('message', function(message) {
  const channel = this.getChannelGroupOrDMByID(message.channel);
  if (channel.is_im && message.type === 'message' && !message.subtype){
    if (message.text === 'hi') {
      //say hello to the user!
      channel.send(`hey friend!`);
    }
    else if(message.text === 'badge') {
      //send the user a prompt to identify who they want to give a badge to!
        channel.send(`Who would you like to recognize today? DM badgebot "badge [Slackuser]"`);
    }
  }
});

export default badgebot;

//the next thing I want to do is type "badge [user]" and send a message to [user] that they were awarded a badge.
