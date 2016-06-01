import Promise from 'bluebird';
import {createCommand, createMatcher, createParser} from 'chatter';
import {query} from '../../../lib/db';
import {findExpertiseAndHandleErrors, abort} from './lib/query';

const intExpProps = ['interest', 'experience'];

function updateExpertise({userName, expertise, newValues}) {
  const {id} = expertise;
  const {interest, experience, reason} = newValues;
  // Old values will be used to show changes at the end. This has to be done
  // before updating the database!
  return query('expertise_by_bocouper_id', userName, id).then(r => r[0])
  .then(oldValues => {
    // Actually make the change in the database.
    const updatePromise = query('update_expertise', userName, id, experience, interest, reason || '');
    return Promise.props({
      oldValues,
      // We need to wait for the update to resolve, but do we care about the result?
      updatePromise,
    });
  })
  .then(({oldValues}) => {
    // Show a summary of the changes.
    const summary = intExpProps.map(prop => {
      const name = prop[0].toUpperCase() + prop.slice(1).toLowerCase();
      if (!oldValues) {
        return `${name} set to ${newValues[prop]}.`;
      }
      else if (String(newValues[prop]) === String(oldValues[prop])) {
        return `${name} unchanged at ${newValues[prop]}.`;
      }
      return `${name} changed from ${oldValues[prop]} to ${newValues[prop]}.`;
    }).join(' ');
    return `_Expertise for *${expertise.expertise}* updated: ${summary}_`;
  });
}

const updateMissingHandler = createMatcher({match: 'missing'}, (_, {user}) => {
  return `> update missing for ${user.name} (coming soon)`;
});

export default createCommand({
  name: 'update',
  description: 'Update your interest and experience for the given expertise.',
  usage: '[missing | <expertise name> [interest=<1-5> experience=<1-5>]]',
}, [
  updateMissingHandler,
  createParser({
    parseOptions: {
      experience: Number,
      interest: Number,
    },
  }, ({args, options: newValues, errors}, {user}) => {
    const search = args.join(' ');
    if (!search) {
      return false;
    }
    const userName = user.name;
    const output = [...errors];
    // Print all cached output + final message + tag line.
    const done = message => [
      output,
      message,
      `View your expertise list with \`expertise me\`.`,
    ];

    return findExpertiseAndHandleErrors(search).then(results => {
      output.push(results.output);
      const {match: expertise} = results;
      const numProps = intExpProps.reduce((n, p) => n + (p in newValues), 0);
      if (numProps === 1) {
        throw abort(`_You must update both interest and experience at the same time._`);
      }
      else if (numProps === 2) {
        return updateExpertise({userName, expertise, newValues}).then(done);
      }
      return `> update ${search} for ${userName} (coming soon)`;
    })
    // Error! Print all cached output + error message + usage info, or re-throw.
    .catch(error => {
      if (error.abortData) {
        return [output, error.abortData];
      }
      throw error;
    });
  }),
]);
