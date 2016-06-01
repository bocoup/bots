import Promise from 'bluebird';
import {createCommand, createMatcher, createParser} from 'chatter';
import heredoc from 'heredoc-tag';
import {query} from '../../lib/db';

// ==================
// FORMATTING HELPERS
// ==================

// Fancy "graphics"
const CIRCLE_FILLED = '\u25CF';
const CIRCLE_EMPTY = '\u25CB';

// Formating helper - formats a value into a small bar graph like this: ●●●○○ (3)
function formatStatusBar(value) {
  return `${CIRCLE_FILLED.repeat(value)}${CIRCLE_EMPTY.repeat(5 - value)}`;
}

// Data-formatting helper.
function formatByInterestAndExperience(rows, fn) {
  if (rows.length === 0) { return null; }
  return [
    `> *Interest*     |  *Experience*`,
    ...rows.map(row => {
      const [interest, experience] = row.interest_experience;
      return heredoc.oneline.trim`
        > ${formatStatusBar(interest)} (${interest}) | ${formatStatusBar(experience)}
        (${experience}): ${fn(row)}
      `;
    }),
  ];
}

// Produces a histogram for a specific expertise for experience and interest.
// provide 0 for interest, and 1 for experience for @interestOrExperiencetypeIdx
function histogramByIndex(rows, fn) {
  const dist = rows.reduce((memo, {interest_experience, employees}) => {
    const level = fn(interest_experience);
    const count = employees.split(',').length;
    memo[level - 1] += count;
    return memo;
  }, [0, 0, 0, 0, 0]);

  return dist.map((count, idx) => `> (${idx + 1}) : ${CIRCLE_FILLED.repeat(count)}`);
}

// Data formatting for expertise statistics
function formatExpertiseStats(expertise) {
  return [
    '*Interest Distribution:*',
    histogramByIndex(expertise, arr => arr[0]),
    '*Experience Distribution:*',
    histogramByIndex(expertise, arr => arr[1]),
  ];
}

// =============
// QUERY HELPERS
// =============

// Error-throwing helper function for bot promise chains.
function abort(...args) {
  const error = new Error();
  error.abortData = args;
  return error;
}

// Find matching expertises for the given search term.
function findExpertiseByName(search) {
  return query('expertise_by_name', search).then(matches => {
    let exact;
    if (matches.length > 0) {
      exact = matches.find(m => m.expertise.toLowerCase() === search.toLowerCase());
    }
    return {
      // All matches.
      matches,
      // The "best" match. Might not be exact.
      match: exact || matches[0],
      // An exact match. (case-insensitive)
      exact: exact || null,
    };
  });
}

// Find the best match for the given search term, and complain if necessary.
function findExpertiseAndHandleErrors(search) {
  const output = [];
  return findExpertiseByName(search).then(({matches, match, exact}) => {
    if (matches.length === 0) {
      throw abort(`_No matches found for expertise "${search}"._`);
    }
    else if (matches.length === 1) {
      output.push(`_You specified "${search}", which matches: *${matches[0].expertise}*._`);
    }
    else {
      const expertiseList = matches.map(o => o.expertise).join(', ');
      output.push(`_Multiple matches were found: ${expertiseList}._`);
      if (exact) {
        output.push(`_You specified "${search}", which matches: *${exact.expertise}*._`);
      }
      else {
        throw abort(`_You specified "${search}", which is ambiguous. Please be more specific._`);
      }
    }
    return {
      matches,
      match,
      exact,
      output,
    };
  })
  .catch(error => {
    // If abort was used, re-throw with abort so the output propagates!
    if (error.abortData) {
      throw abort(...output, error.abortData);
    }
    throw error;
  });
}

function getIntExpScales() {
  return query('expertise_scales')
  .then(results => results.reduce((memo, {type, id, name}) => {
    if (!memo[type]) {
      memo[type] = {};
    }
    memo[type][id] = name;
    return memo;
  }, {}));
}

// ========
// COMMANDS
// ========

function forHandler(name, {bot, user}) {
  if (!name) {
    return false;
  }
  else if (name === 'me') {
    name = user.name;
  }
  else {
    name = bot.getName(name);
  }
  const isMe = name === user.name;
  return Promise.all([
    query('expertise_interest_experience_by_bocouper', name),
    query('expertise_outstanding_by_bocouper', name),
  ])
  .spread((expertise, [{outstanding}]) => [
    `Listing all expertise for ${bot.getRealName(name)}:`,
    !isMe && outstanding && `> *No data for:* ${outstanding}`,
    formatByInterestAndExperience(expertise, o => o.expertise) || '> No expertise data found.',
    isMe && outstanding && `_*No data for:* ${outstanding}_`,
    isMe && `_Update your expertise with_ \`expertise update\`.`,
  ]);
}

const forCommand = createCommand({
  name: 'for',
  description: 'List all expertises for the given Bocouper, grouped by interest and experience.',
  usage: '[me | @bocouper]',
}, createParser(({args: [name]}, meta) => forHandler(name, meta)));

const meCommand = createCommand({
  name: 'me',
  description: 'List all of your expertises, grouped by interest and experience.',
}, createParser((args, meta) => forHandler('me', meta)));

const listCommand = createCommand({
  name: 'list',
  description: 'List all expertises, grouped by area.',
}, createParser(() => {
  return query('expertise').then(rows => {
    return rows.map(({expertise, area}) => {
      return `*${area}*\n> ${expertise}`;
    });
  });
}));

const findCommand = createCommand({
  name: 'find',
  description: 'List all Bocoupers with the given expertise, grouped by interest and experience.',
  usage: '<expertise name>',
}, createParser(({args}) => {
  const search = args.join(' ');
  if (!search) {
    return false;
  }
  const output = [];
  return findExpertiseAndHandleErrors(search).then(results => {
    const {match} = results;
    output.push(results.output);
    return Promise.all([
      query('expertise_for_all', match.id),
      query('expertise_outstanding_by_id', match.id),
    ])
    .spread((expertise, [{employees: outstanding}]) => {
      if (outstanding) {
        output.push(`> *No data for:* ${outstanding}`);
      }
      return formatByInterestAndExperience(expertise, o => o.employees);
    });
  })
  // Success! Print all cached output + final message.
  .then(message => [output, message])
  // Error! Print all cached output + error message + usage info, or re-throw.
  .catch(error => {
    if (error.abortData) {
      return [output, error.abortData];
    }
    throw error;
  });
}));

const statsCommand = createCommand({
  name: 'stats',
  description: 'Provide statistics about a given expertise.',
  usage: '<expertise name>',
}, createParser(({args}) => {
  const search = args.join(' ');
  if (!search) {
    return false;
  }
  const output = [];
  return findExpertiseAndHandleErrors(search).then(results => {
    const {match} = results;
    output.push(results.output);
    return Promise.all([
      query('expertise_for_all', match.id),
      query('expertise_outstanding_by_id', match.id),
    ])
    .spread((expertise, [{employees: outstanding}]) => {
      // Output an overall count of missing people, instead of all the names.
      const outstandingCount = outstanding.split(',').length;
      output.push(heredoc.oneline.trim`
        The following represents the distribution of responses from the coop,
        *minus ${outstandingCount} ${outstandingCount > 1 ? 'people' : 'person'}*.
      `);
      return formatExpertiseStats(expertise);
    });
  })
  // Success! Print all cached output + final message.
  .then(message => [output, message])
  // Error! Print all cached output + error message + usage info, or re-throw.
  .catch(error => {
    if (error.abortData) {
      return [output, error.abortData];
    }
    throw error;
  });
}));

const scalesCommand = createCommand({
  name: 'scales',
  description: 'List interest and experience scales.',
}, createParser(() => {
  return getIntExpScales().then(({interest, experience}) => {
    const list = o => Object.keys(o).map(k => `> *${k}.* ${o[k]}`);
    return [
      '*Interest:*',
      list(interest),
      '*Experience:*',
      list(experience),
    ];
  });
}));

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

const updateCommand = createCommand({
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

export default createCommand({
  name: 'expertise',
  description: 'Show your expertise.',
}, [
  forCommand,
  meCommand,
  listCommand,
  findCommand,
  statsCommand,
  scalesCommand,
  updateCommand,
]);
