// =====================
// Misc SlackBot helpers
// =====================

const bot = {};

export default function mixinBotHelpers(target) {
  for (const prop in bot) {
    target[prop] = bot[prop];
  }
}

// Get user name sans leading sigil, eg: cowboy
bot.getName = function(name) {
  return this.parseMessage(name || '').replace(/^@/, '');
};

// Get user object.
bot.getUser = function(name) {
  return this.slack.rtmClient.dataStore.getUserByName(this.getName(name));
};

// Get real name and fallback to user name.
bot.getRealName = function(name) {
  const user = this.getUser(name);
  return user.real_name || user.name;
};

// Get formatted slackname, eg: <@U025GMQTB>
bot.formatUser = function(name) {
  return `<@${this.getUser(name).id}>`;
};
