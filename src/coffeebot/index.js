// IMPORTS
const { RtmClient } = require('@slack/client');
const https = require('https');
const querystring = require('querystring');
import config from '../../config';


// EXPORTS
let USER_LAST_BREWED = ''
let TIME_LAST_BREWED = '';
let IN_CARAFE = false

// An access token (from your Slack app or custom integration - usually xoxb)
const TOKEN = config.tokens.coffeebot;

// The client is initialized and then started to get an active connection to the platform
const bot = new RtmClient(TOKEN);

// MESSAGE HANDLER
bot.on('message', async (message) => {
  // For structure of `message`, see https://api.slack.com/events/message
  let botMessage = '';

  // HELP MODE
  if (message.text.includes('help')) {
    botMessage = `
        These are the available commands:
        
        brew:       Tell coffeebot that you brewed coffee
        empty:      Tell coffeebot that the coffee pot is empty
        carafe:     Tell coffeebot that the coffee is in the carafe
        status:     Ask coffeebot if the coffee pot is empty or not
        roulette:   Choose someone to make coffee
    `;
  }

  // BREW MODE
  if (message.text.includes('brew')) {
    USER_LAST_BREWED = message.user;
    TIME_LAST_BREWED = message.ts.split('.')[0];
    botMessage = `<@${message.user}> brewed coffee ☕️!`;
  }


  // STATUS MODE
  if (message.text.includes('status')) {
    if (USER_LAST_BREWED && TIME_LAST_BREWED) {
      botMessage = `<@${USER_LAST_BREWED}> brewed coffee on <!date^${TIME_LAST_BREWED}^{date} at {time}|${new Date().toLocaleString()}>. The coffee is in the ${ IN_CARAFE ? 'carafe' : 'pot' }!`;
    } else {
      botMessage = 'Someone needs to brew coffee!';
    }
  }

  // Empty mode
  if (message.text.includes('empty')) {
    USER_LAST_BREWED = '';
    TIME_LAST_BREWED = '';
    IN_CARAFE = false;
    botMessage = 'The coffee pot is empty! Please make more coffee. Or else.';
  }


  // Carafe mode
  if (message.text.includes('carafe')) {
    if ( USER_LAST_BREWED && TIME_LAST_BREWED ) {
      IN_CARAFE = true;
      botMessage = 'Coffee is in the carafe!';
    }
    else {
      botMessage = 'Someone needs to brew coffee!';
    }
  }

  // Roulette mode
  if (message.text.includes('roulette')) {
    if (message.channel.startsWith('C')){

      let getChannelMembers = async () => {
        return new Promise((resolve, reject) => {
          const postData = querystring.stringify({
            token: config.tokens.coffeebot,
            channel: message.channel
          });

          const options = {
            host: 'slack.com',
            port: 443,
            method: 'POST',
            path: '/api/channels.info',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': postData.length
            }
          };

          const req = https.request(options, function (res) {
            let result = '';
            res.on('data', function (chunk) {
              result += chunk;
            });
            res.on('end', function () {
              resolve(result);
            });
            res.on('error', function (err) {
              console.log(err);
            })
          });

          // req error
          req.on('error', function (err) {
            console.log(err);
          });

          //send request witht the postData form
          req.write(postData);
          req.end();
        })
      }

      const channelMembersResponse = await getChannelMembers();
      const channelMembers = JSON.parse(channelMembersResponse).channel.members;
      const rouletteUser = channelMembers[Math.floor(Math.random() * channelMembers.length)]

      botMessage = `<@${rouletteUser}>, go make coffee!`;

    } else {
      botMessage = 'You must be in a channel for this feature to work!';
    }
  }


  const res = await bot.sendMessage(botMessage, message.channel);
  console.log('Message sent: ', res.ts);
});

export default bot;