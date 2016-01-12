import fs from 'fs';
import path from 'path';

export function get(config, name) {
  const tokenFile = path.join(__dirname, '../../TOKEN_' + name.toUpperCase());
  let key;
  if (fs.existsSync(tokenFile)) {
    console.log('Using Slack API token from', tokenFile);
    key = fs.readFileSync(tokenFile, 'utf8').replace(/^\s+|\s+$/g, '');
  }
  else {
    console.log('Using Slack API token from config.creds.slack.' + name);
    key = config.creds.slack[name][config.env];
  }
  return key;
}
