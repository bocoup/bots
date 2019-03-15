/*
 * A command to remember info.
 */
import {createCommand} from 'chatter';
import {query} from '../../lib/db';

export default (message) => {
	createCommand({
	  name: 'remember',
	  description: 'Save a command for Infobert to remember.',
	  usage: '[remember command \'reply in quotes\']',
	}, (message) => {
	  if (!message) {
	    return 'Make sure you give Infobert both a command and a message to reply with.';
	  }

	  //console.log('channel', channel);
	  // const channelName = 'test';
	  // const channel = bot.slack.rtmClient.dataStore.getChannelByName(channelName).id;
	  // return query('infobert_remember', channelName, command, reply)
	  //   .then(() => bot.sendResponse({channel}, `Thanks! Now Infobert remembers ${reply} when you say ${command}`));
	  return message;
	});
};


