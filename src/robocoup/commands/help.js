const bPromise = require('bluebird');

function excludeHelp(name) { return name !== 'help' && name !== 'index'; }

exports.handler = bPromise.method(function (user, action) {
  // this is inside the method to prevent cyclical dependencies
  const commands = require('./');
  const command = commands[action];
  const commandNames = Object.keys(commands).filter(excludeHelp);
  if (!action) {
    return '`Usage: help ['+commandNames.join(', ')+']`';
  }
  if (command) {
    return command.usage;
  }
});
