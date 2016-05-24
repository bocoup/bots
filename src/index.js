import config from '../config';

import robocoup from './robocoup';
robocoup.login();

import thanksbot from './thanksbot';
thanksbot.login();

import pombot from './pombot';
if (config.tokens.pombot) {
  pombot.login();
}
