/*
 * Utility methods for handling realtime slack messages.
 */

// Deparse the format specified here: https://api.slack.com/docs/formatting
const wrappedReg = new RegExp('<(.*?)>', 'g');
export function deparse(slack, message) {
  let matched, lookup, replacement;
  let newMessage = message;
  while ((matched = wrappedReg.exec(message)) !== null) {
    switch (matched[1][0]) {
      case '#':
        lookup = slack.getChannelByID(matched[1].substring(1));
        replacement = (lookup && lookup.name) ? '#' + lookup.name : null;
        break;
      case '@':
        lookup = slack.getUserByID(matched[1].substring(1));
        replacement = (lookup && lookup.name) ? '@' + lookup.name : null;
        break;
      default:
        replacement = matched[1].split('|')[0];
        break;
    }
    if (replacement) {
      newMessage = newMessage.replace(matched[0], replacement);
    }
  }
  return newMessage;
}
