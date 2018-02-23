/* eslint-disable no-sparse-arrays, comma-spacing, comma-dangle */

import R from 'ramda';
import emoji from 'node-emoji';
import wordwrap from 'wordwrap';
import moment from 'moment';

const CRLF = '\r\n';
const LOGO = [
  '  ████████╗██╗  ██╗ █████╗ ███╗   ██╗██╗  ██╗███████╗██████╗  ██████╗ ████████╗',
  '  ╚══██╔══╝██║  ██║██╔══██╗████╗  ██║██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝',
  '     ██║   ███████║███████║██╔██╗ ██║█████╔╝ ███████╗██████╔╝██║   ██║   ██║',
  '     ██║   ██╔══██║██╔══██║██║╚██╗██║██╔═██╗ ╚════██║██╔══██╗██║   ██║   ██║',
  '     ██║   ██║  ██║██║  ██║██║ ╚████║██║  ██╗███████║██████╔╝╚██████╔╝   ██║',
  '     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝    ╚═╝',
].join(CRLF);
const BAR = CRLF + '°º¤ø,¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸,ø¤º°`°º¤ø,¸,ø¤º°`°º¤ø,¸,ø¤°º' + CRLF;
const HOWTO = 'To participate, simply send a message to "thanksbot" on Slack!';
const FOOTER = [,,BAR,,`That's all for now, see you next week!`].join(CRLF);
const wrap = wordwrap(2, 78);

function formatEntry(entry) {
  const time = moment(entry.created_at).format('hh:mm A');
  const heading = `[${time} EST] ${entry.sender} said:`;
  const message = wrap(emoji.emojify(entry.message), 80, `${CRLF}  `);
  return CRLF + heading + CRLF + message;
}

const groupByEntryDate = R.groupBy(R.pipe(
  R.prop('created_at'),
  R.invoker(0, 'toISOString'),
  R.take(10)
));
const formatEntries = R.map(formatEntry);

export function prettyDate(date = new Date()) {
  return moment(date).format('MMMM Do, YYYY');
}

// TODO: support arbitrary date ranges
export function generate(thanks) {
  const groupedEntries = groupByEntryDate(thanks);
  const days = R.keys(groupedEntries);
  const welcome = `Welcome to the ${prettyDate()} edition of:`;
  const HEADER = [welcome,, LOGO,, HOWTO,].join(CRLF);
  const digest = R.reduce(function(log, date) {
    const dayHeading = moment(date).format('On dddd MMMM Do...');
    const entries = formatEntries(groupedEntries[date]);
    return log + [,,BAR,,dayHeading,,].join(CRLF) + entries.join(CRLF);
  })('', days);
  return HEADER + digest + FOOTER;
}
