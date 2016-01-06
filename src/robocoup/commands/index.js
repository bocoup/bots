/*
 * Export an object containing all commands keyed by filename.
 */

const fs = require('fs');
const path = require('path');

const commandFiles = fs.readdirSync(__dirname);

module.exports = commandFiles.reduce(function (result, commandFile) {
  const command = commandFile.slice(0, -3);
  result[command] = require(path.join(__dirname, commandFile));
  return result;
}, {});
