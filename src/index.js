import config from '../config';

import robocoup from './robocoup';
robocoup.login();

import thanksbot from './thanksbot';
if (config.tokens.thanksbot) {
  thanksbot.login();
}

import pombot from './pombot';
if (config.tokens.pombot) {
  pombot.login();
}

import newbot from './new-bot';
if (config.tokens.newbot) {
  newbot.login();
}
