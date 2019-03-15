import fs from 'fs';
import path from 'path';
import {createCommand} from 'chatter';


/*
 * A command to show communication preferences
 */

export default createCommand({
  name: "prefs",
  description: "Communication preferences for Coop"
}, () => {
  const filePath = path.join(__dirname, 'pref-data.json');
  let answer = `Thanks for asking - here are preferences: `;

  return new Promise((resolve, reject) => {

    fs.readFile(filePath, (err, response) => {
      const results = JSON.parse(response);
      const names = Object.keys(results);

      names.forEach((name) => {
        answer += `
        ${name}: 
        Pronouns: ${results[name].pronouns}
        Start time: ${results[name].work_start_time}
        End time:  ${results[name].work_end_time}
        Exceptions to standard: ${results[name].work_hours_exceptions}
        Non-urgent communications preferences: ${results[name].comm_preferences.not_urgent}
        Urgent communications preferences: ${results[name].comm_preferences.urgent}
        
        ---------------------------------------------------------------
`;
      });
      resolve(answer);
    });
  }).catch((error) => {
    reject(`whooooops something went wrong ${error}`);
  });
});