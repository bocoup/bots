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
export function createBot(name, key) {
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
