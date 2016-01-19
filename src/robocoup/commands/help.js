import Promise from 'bluebird';

function excludeHelp(name) { return name !== 'help' && name !== 'index'; }

export const handler = Promise.method(function(meta, action) {
  // this is inside the method to prevent cyclical dependencies
  const commands = require('./');
  const command = commands[action];
  const commandNames = Object.keys(commands).filter(excludeHelp);
  if (!action) {
    return `\`Usage: help [${commandNames.join(', ')}]\``;
  }
  if (command) {
    if (command.commands && command.commands.help) {
      return command.handler({command: action}, 'help');
    }
    else if (command.usage) {
      return command.usage;
    }
  }
  return `No help is currently available for *${action}*.`;
});
