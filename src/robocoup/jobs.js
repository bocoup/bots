import heredoc from 'heredoc-tag';
import Promise from 'bluebird';

import Scheduler from '../lib/scheduler';
import {sendDM} from '../lib/bot';
import {query} from '../lib/db';

const scheduler = new Scheduler();
export default scheduler;

scheduler.add('00 0 12 * * 1-5', function() {
  query('expertise_outstanding_for_all').then(users => {
    return Promise.map(users, ({slack, outstanding}, idx) => {
      const delay = Promise.delay(1000 * idx);
      const plural = outstanding.length !== 1;
      const message = heredoc.oneline.trim`
        You have *${outstanding.length}* outstanding expertise${plural ? 's' : ''}.
        Please update ${plural ? 'them' : 'it'} by saying \`expertise update missing\` to me.
      `;
      return delay.then(() => sendDM(this, slack, message));
    }).catch(e => console.error(e.message));
  });
});
