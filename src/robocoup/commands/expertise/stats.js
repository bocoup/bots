import Promise from 'bluebird';
import {createCommand, createParser} from 'chatter';
import heredoc from 'heredoc-tag';
import {query} from '../../../lib/db';
import {findExpertiseAndHandleErrors} from './lib/query';
import {formatExpertiseStats} from './lib/formatting';

export default createCommand({
  name: 'stats',
  description: 'Provide statistics about a given expertise.',
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
      // Output an overall count of missing people, instead of all the names.
      const outstandingCount = outstanding.split(',').length;
      output.push(heredoc.oneline.trim`
        The following represents the distribution of responses from the coop,
        *minus ${outstandingCount} ${outstandingCount > 1 ? 'people' : 'person'}*.
      `);
      return formatExpertiseStats(expertise);
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
