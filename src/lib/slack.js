/*
 * Utility methods for handling realtime slack messages.
 */
exports.deparse = deparse;

// Deparse the format specified here: https://api.slack.com/docs/formatting
const wrappedReg = new RegExp('<(.*?)>', 'g');
function deparse(message) {
  var matched, re, lookup, replacement;
  var newMessage = message;
  while ((matched = wrappedReg.exec(message)) !== null) {
    switch (matched[1][0]) {
      case '#':
        lookup = this.getChannelByID(matched[1].substring(1));
        replacement = (lookup && lookup.name) ? '#'+lookup.name : null;
        break;
      case '@':
        lookup = this.getUserByID(matched[1].substring(1));
        replacement = (lookup && lookup.name) ? '@'+lookup.name : null;
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
