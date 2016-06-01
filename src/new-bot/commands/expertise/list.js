import {createCommand} from 'chatter';
import {query} from '../../../lib/db';

export default createCommand({
  name: 'list',
  description: 'List all expertises, grouped by area.',
}, () => {
  return query('expertise').then(rows => {
    return rows.map(({expertise, area}) => {
      return `*${area}*\n> ${expertise}`;
    });
  });
});
