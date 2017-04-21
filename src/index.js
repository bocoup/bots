import config from '../config';

import robocoup from './robocoup';
if (config.tokens.robocoup) {
  robocoup.login();
}

import thanksbot from './thanksbot';
if (config.tokens.thanksbot) {
  thanksbot.login();
}

import effortbot from './effortbot';
if (config.tokens.effortbot) {
  effortbot.login();
}
