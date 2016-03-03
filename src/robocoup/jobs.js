import heredoc from 'heredoc-tag';

import Scheduler from '../lib/scheduler';
import {sendDM} from '../lib/bot';
import {query} from '../lib/db';

const scheduler = new Scheduler();
export default scheduler;

scheduler.add('00 00 09 * * 1', function() {
  query('expertise_outstanding_for_all').then(users => {
    const promises = users.map(({slack, outstanding}) => {
      const plural = outstanding.length !== 1;
      const message = heredoc.oneline.trim`
        You have ${outstanding.length} outstanding expertise${plural ? 's' : ''} (${outstanding.join(', ')}).
        Please update ${plural ? 'them' : 'it'} with the \`expertise update missing\` command.
      `;
      return sendDM(this, slack, message);
    });
    return Promise.all(promises).catch(e => console.error(e.message));
  });
});
