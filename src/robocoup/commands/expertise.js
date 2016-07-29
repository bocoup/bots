import {createCommand} from 'chatter';

export default createCommand({
  name: 'expertise',
  description: 'Expertise functionality has moved into @skillsbot.',
}, (message, {bot}) => {
  const {id, name} = bot.getUser('skillsbot') || {};
  const command = cmd => `\`/dm @${name} ${cmd}\``;
  return [
    `Expertise functionality has moved into <@${id}>.`,
    `Say ${command('help')} for more information.`,
  ];
});
