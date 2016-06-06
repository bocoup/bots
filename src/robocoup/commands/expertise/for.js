import Promise from 'bluebird';
import {createCommand, createParser} from 'chatter';
import {query} from '../../../lib/db';
import {formatByInterestAndExperience} from './lib/formatting';

function forHandler(name, {bot, user}) {
  if (!name) {
    return false;
  }
  else if (name === 'me') {
    name = user.name;
  }
  else {
    name = bot.getName(name);
  }
  const isMe = name === user.name;
  return Promise.all([
    query('expertise_interest_experience_by_bocouper', name),
    query('expertise_outstanding_by_bocouper', name),
  ])
  .spread((expertise, [{outstanding}]) => [
    `Listing all expertise for ${bot.getRealName(name)}:`,
    !isMe && outstanding && `> *No data for:* ${outstanding}`,
    formatByInterestAndExperience(expertise, o => o.expertise) || '> No expertise data found.',
    isMe && outstanding && `_*No data for:* ${outstanding}_`,
    isMe && `_Update your expertise with_ \`expertise update\`.`,
  ]);
}

export const forCommand = createCommand({
  name: 'for',
  description: 'List all expertises for the given Bocouper, grouped by interest and experience.',
  usage: '[me | @bocouper]',
}, createParser(({args: [name]}, meta) => forHandler(name, meta)));

export const meCommand = createCommand({
  name: 'me',
  description: 'List all of your expertises, grouped by interest and experience.',
}, createParser((args, meta) => forHandler('me', meta)));
