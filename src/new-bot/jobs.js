import heredoc from 'heredoc-tag';
import Promise from 'bluebird';

import Scheduler from '../lib/scheduler';
import {query} from '../lib/db';

const scheduler = new Scheduler();
export default scheduler;

scheduler.add('00 0 12 * * 1-5', function(bot) {
  query('expertise_outstanding_for_all')
  .mapSeries(({slack, outstanding}, idx) => {
    const userId = bot.getUser(slack).id;
    const plural = outstanding.length !== 1;
    const message = heredoc.oneline.trim`
      You have *${outstanding.length}* outstanding expertise${plural ? 's' : ''}.
      Please update ${plural ? 'them' : 'it'} by saying \`expertise update missing\` to me.
    `;
    return bot.postMessage(userId, message).delay(1000);
  })
  .catch(e => console.error('expertise_outstanding_for_all', e.message));
});
