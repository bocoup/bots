import config from '../config';

import robocoup from './robocoup';
if (config.tokens.robocoup) {
  robocoup.login();
}

import thanksbot from './thanksbot';
if (config.tokens.thanksbot) {
  thanksbot.login();
}

import infobert from './infobert';
if (config.tokens.infobert) {
  infobert.login();
}
