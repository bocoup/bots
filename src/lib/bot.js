import fs from 'fs';
import path from 'path';
import Slack from 'slack-client';

// Dummy bot
export class DummyBot {
  constructor(name) {
    this.name = name;
  }
  on() {
    // Do nothing.
  }
  login() {
    console.log(`No key specified for ${this.name}, not logging in.`);
  }
}

// Create a Slack bot. If in production, use the config key, otherwise use the
// local TOKEN_BOTNAME file. If no key is found, create a dummy bot interface
// that does nothing.
export function createBot(config, name) {
  let key;
  const tokenFile = path.join(__dirname, '../../TOKEN_' + name.toUpperCase());
  if (config.env === 'production') {
    console.log('Using Slack API token from config.creds.slack.' + name);
    key = config.creds.slack[name];
  }
  else if (fs.existsSync(tokenFile)) {
    console.log('Using Slack API token from', tokenFile);
    key = fs.readFileSync(tokenFile, 'utf8').replace(/^\s+|\s+$/g, '');
  }
  if (!key) {
    return new DummyBot(name);
  }
  return new Slack(key, true, true);
}

// Send a direct message to a user.
export function sendDM(botInstance, slackName, message) {
  return new Promise(function(resolve, reject) {
    const user = botInstance.getUserByName(slackName);
    if (!user) {
      throw new Error(`User "${slackName}" not found.`);
    }
    botInstance.openDM(user.id, function({channel: {id}}) {
      const dm = botInstance.getDMByID(id);
      dm.send(message);
      resolve();
    });
  });
}
