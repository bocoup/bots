const fs = require('fs');
const path = require('path');

exports.get = function(config, name) {
  var tokenFile = path.join(__dirname, '../../TOKEN_' + name.toUpperCase());
  var key;
  if (fs.existsSync(tokenFile)) {
    console.log('Using Slack API token from', tokenFile);
    key = fs.readFileSync(tokenFile, 'utf8').replace(/^\s+|\s+$/g, '');
  }
  else {
    console.log('Using Slack API token from config.creds.slack.' + name);
    key = config.creds.slack[name][config.env];
  }
  return key;
};
