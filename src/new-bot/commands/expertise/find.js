import Promise from 'bluebird';
import {createCommand, createParser} from 'chatter';
import {query} from '../../../lib/db';
import {findExpertiseAndHandleErrors} from './lib/query';
import {formatByInterestAndExperience} from './lib/formatting';

export default createCommand({
  name: 'find',
  description: 'List all Bocoupers with the given expertise, grouped by interest and experience.',
  usage: '<expertise name>',
}, createParser(({args}) => {
  const search = args.join(' ');
  if (!search) {
    return false;
  }
  const output = [];
  return findExpertiseAndHandleErrors(search).then(results => {
    const {match} = results;
    output.push(results.output);
    return Promise.all([
      query('expertise_for_all', match.id),
      query('expertise_outstanding_by_id', match.id),
    ])
    .spread((expertise, [{employees: outstanding}]) => {
      if (outstanding) {
        output.push(`> *No data for:* ${outstanding}`);
      }
      return formatByInterestAndExperience(expertise, o => o.employees);
    });
  })
  // Success! Print all cached output + final message.
  .then(message => [output, message])
  // Error! Print all cached output + error message + usage info, or re-throw.
  .catch(error => {
    if (error.abortData) {
      return [output, error.abortData];
    }
    throw error;
  });
}));
