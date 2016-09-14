import Scheduler from '../lib/scheduler';
import {generate, prettyDate} from './lib/digest';
import {query} from '../lib/db';
import reminder from './lib/reminder';
import email from '../lib/email';

const scheduler = new Scheduler();
export default scheduler;

scheduler.add('0 7 * * 1', function(bot) {
  query('thanks_log').then(generate).then(digest => {
    return email({
      from: 'ThanksBot <coop+thanksbot@bocoup.com>',
      to: 'Everybody <coop@bocoup.com>',
      subject: `ThanksBot Weekly: ${prettyDate()}`,
      html: `<pre>${digest}</pre>`,
      text: digest,
    });
  });
});

scheduler.add('00 30 11 * * 1-5', reminder);
