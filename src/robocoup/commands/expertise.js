import Promise from 'bluebird';
import heredoc from 'heredoc-tag';

import {parseArgs} from '../../lib/args';
import {query} from '../../lib/db';
import Dialog from '../../lib/dialog';

// https://github.com/bocoup/bocoup-meta/issues/243#issuecomment-187268880
const EXPERIENCE = [
  'I have no experience with this.',
  'I have some experience but I am not yet confident with this.',
  'I have some experience and feel confident with this.',
  'I have lots of experience and can teach others this.',
  'I would feel comfortable having a team of people rely on me for this.',
];
const INTEREST = [
  'I really dislike this. Please do not ask me to use this!',
  'I would like to avoid this if possible.',
  'I have no feelings for or against this.',
  'I would like to use this.',
  'I would love to use this. Please ask me to use this!',
];

const description = {
  brief: 'Show your expertise.',
  full: [
    '*Experience:*',
    EXPERIENCE.map((s, i) => `\`${i + 1}\` - ${s}`),
    '*Interest:*',
    INTEREST.map((s, i) => `\`${i + 1}\` - ${s}`),
  ],
};

// ================================
// TODO: MAKE THIS STUFF INTO A LIB
// ================================

export const commands = {};

function addCommand(name, options) {
  commands[name] = options;
}

function usage() {
  const commandList = Object.keys(commands).sort().join(', ');
  return [
    description.brief,
    `\`Usage: ${this.command} [${commandList}]\``,
  ];
}

export function handler(meta, subcommand, ...args) {
  const {channel, user, command} = meta;
  const cmdObj = commands[subcommand];
  const thisObj = {
    channel,
    user,
    command,
    subcommand,
    fullcommand: `${command} ${subcommand}`,
    usage() {
      return `\`Usage: ${cmdObj.usage(this.fullcommand)}\``;
    },
    proxy(name, ...args1) {
      return handler(meta, name, ...args1);
    },
  };
  if (cmdObj) {
    return cmdObj.fn.apply(thisObj, args);
  }
  return usage.call(thisObj);
}

addCommand('help', {
  description: 'Display per-command help.',
  fn() {
    return [
      description.brief,
      `\`Usage: ${this.command} [command]\``,
      '*Commands:*',
      Object.keys(commands).sort().map(name => {
        return `\`${name}\` - ${commands[name].description}`;
      }),
      description.full,
    ];
  },
});

// =======
// HELPERS
// =======

// Error-throwing helper function for bot promise chains.
function abort(...args) {
  const error = new Error();
  error.abortData = args;
  return error;
}

// Get user name sans leading sigil.
const getName = (name = '') => name.replace(/^@/, '');

// Data-formatting helper.
function formatByInterestAndExperience(rows, fn) {
  return rows.map(row => {
    const [interest, experience] = row.interest_experience;
    return `> *Interest=${interest}, Experience=${experience}:* ${fn(row)}`;
  });
}

// Find matching expertises for the given search term.
function findExpertise(search) {
  return query('expertise_by_name', search).then(matches => {
    let exact;
    if (matches.length > 0) {
      exact = matches.filter(m => m.expertise.toLowerCase() === search.toLowerCase())[0];
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
  return findExpertise(search).then(({matches, match, exact}) => {
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

// ============
// SUB-COMMANDS
// ============

addCommand('for', {
  description: 'List all expertises for the given Bocouper, grouped by interest and experience.',
  usage: command => `${command} [me, bocouper]`,
  fn(name) {
    if (!name) {
      return this.usage();
    }
    else if (name === 'me') {
      name = this.user.name;
    }
    name = getName(name);
    const me = name === this.user.name;
    const output = [];
    return Promise.props({
      expertise: query('expertise_interest_experience_by_bocouper', name),
      outstanding: query('expertise_outstanding_by_bocouper', name),
    }).then(({expertise, outstanding: [{outstanding}]}) => {
      output.push(`Listing all expertise for *@${name}*:`);
      if (!me && outstanding) {
        output.push(`> *No data for:* ${outstanding}`);
      }
      if (expertise.length) {
        output.push(formatByInterestAndExperience(expertise, o => o.expertise));
      }
      if (me && outstanding) {
        output.push(`_*No data for:* ${outstanding}_`);
      }
      return [
        ...output,
        me ? `_Update your expertise with_ \`${this.command} update\`.` : null,
      ];
    });
  },
});

addCommand('me', {
  description: 'List all of your expertises, grouped by interest and experience.',
  fn() {
    return this.proxy('for', 'me');
  },
});

addCommand('list', {
  description: 'List all expertises, grouped by area.',
  fn() {
    return query('expertise').then(rows => {
      return rows.map(({expertise, area}) => {
        return `*${area}:* ${expertise}`;
      });
    });
  },
});

addCommand('find', {
  description: 'List all Bocoupers with the given expertise, grouped by interest and experience.',
  usage: command => `${command} <expertise>`,
  fn(...args) {
    const search = parseArgs(args).remain.join(' ');
    if (!search) {
      return this.usage();
    }
    const output = [];
    return findExpertiseAndHandleErrors(search).then(results => {
      const {match} = results;
      output.push(results.output);
      return Promise.props({
        expertise: query('expertise_for_all', match.id),
        outstanding: query('expertise_outstanding_by_id', match.id),
      }).then(({expertise, outstanding: [{employees: outstanding}]}) => {
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
  },
});

const intExpProps = ['interest', 'experience'];

function updateExpertise({user, expertise, newValues}) {
  const {id} = expertise;
  const {interest, experience, reason} = newValues;
  // Old values will be used to show changes at the end. This has to be done
  // before updating the database!
  return query('expertise_by_bocouper_id', user, id).then(r => r[0])
  .then(oldValues => {
    // Actually make the change in the database.
    const updatePromise = query('update_expertise', user, id, experience, interest, reason || '');
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
      else if (newValues[prop] === oldValues[prop]) {
        return `${name} unchanged at ${newValues[prop]}.`;
      }
      return `${name} changed from ${oldValues[prop]} to ${newValues[prop]}.`;
    }).join(' ');
    return `Done! ${summary}`;
  });
}

function updateExpertiseDialog({
  channel,
  user,
  expertise,
  command,
  oneTimeHeader = null,
  done = val => val,
}) {
  const expertiseName = `${expertise.type.toLowerCase()} *${expertise.expertise}*`;
  return Promise.try(() => {
    const dialog = new Dialog({
      channel,
      timeout: 30,
      onTimeout: `Timed out, please type \`${command}\` to try again.`,
      onCancel: () => {
        return `Canceled, please type \`${command}\` to try again.`;
      },
    });

    function ask(_oneTimeHeader) {
      const newValues = {};
      return dialog.questions({
        oneTimeHeader: _oneTimeHeader,
        question: ({exit, timeout}) => heredoc.trim.oneline`
          Please choose your interest level for ${expertiseName} or type *${exit}* to cancel.
          You have ${timeout} seconds:
        `,
        choices: INTEREST,
        onMatch: match => {
          newValues.interest = match;
          return `You selected *${newValues.interest}* for interest, thanks!`;
        },
      }, {
        question: ({exit, timeout}) => heredoc.trim.oneline`
          Please choose your experience level for ${expertiseName} or type *${exit}* to cancel.
          You have ${timeout} seconds:
        `,
        choices: EXPERIENCE,
        onMatch: match => {
          newValues.experience = match;
          return `You selected *${newValues.experience}* for experience, thanks!`;
        },
      }, () => {
        return query('expertise_by_bocouper_id', user, expertise.id).then(r => r[0])
        .then(oldValues => {
          if (oldValues) {
            return {
              question: ({exit, timeout}) => heredoc.trim.unindent`
                Why has your experience/interest changed for ${expertiseName}?
                Please explain, or type *${exit}* to cancel. You have ${timeout} seconds:
              `,
              onResponse: reason => {
                newValues.reason = reason;
                return 'Noted!';
              },
            };
          }
        });
      }, {
        question: ({exit, timeout}) => {
          const reason = 'reason' in newValues ? `> Reason: *${newValues.reason}*\n` : '';
          return heredoc.trim.unindent`
            You've entered the following for ${expertiseName}. Is this ok?

            > Interest: *${INTEREST[newValues.interest - 1]}* (${newValues.interest})
            > Experience: *${EXPERIENCE[newValues.experience - 1]}* (${newValues.experience})
            ${reason}
            Please choose one of the following, or type *${exit}* to cancel. You have ${timeout} seconds:
          `;
        },
        choices: [
          `Yes, update interest and experience for ${expertiseName}.`,
          `No, re-choose interest and experience for ${expertiseName}.`,
        ],
        onMatch(match) {
          if (match !== 1) {
            return ask();
          }
          console.log('newValues', newValues);
          return updateExpertise({user, expertise, newValues}).then(done);
        },
      });
    }
    return ask(oneTimeHeader);
  });
}

addCommand('update', {
  description: 'Update your interest and experience for the given expertise.',
  usage: command => `${command} <expertise> [interest=<1-3> experience=<1-3>]`,
  fn(...args) {
    const parsed = parseArgs(args, {
      experience: Number,
      interest: Number,
      // user: String, // Uncomment to allow specifying user when testing
    });
    const user = getName(parsed.options.user) || this.user.name;
    const search = parsed.remain.join(' ');
    const output = [...parsed.errors];

    if (!search) {
      return this.usage();
    }

    // Print all cached output + final message + tag line.
    const done = message => [
      output,
      message,
      `View your expertise list with \`expertise me\`.`,
    ];

    return findExpertiseAndHandleErrors(search).then(results => {
      output.push(results.output);

      const {match} = results;
      const newValues = parsed.options;
      const numProps = intExpProps.reduce((n, p) => n + (p in newValues), 0);
      if (numProps === 1) {
        throw abort(`_You must update both interest and experience at the same time._`, this.usage());
      }
      else if (numProps === 2) {
        return updateExpertise({user, expertise: match, newValues}).then(done);
      }
      const command = `expertise update ${search.toLowerCase()}`;
      return updateExpertiseDialog({
        channel: this.channel,
        user,
        expertise: match,
        command,
        oneTimeHeader: output.splice(0, output.length),
        done,
      });
    })
    // Error! Print all cached output + error message + usage info, or re-throw.
    .catch(error => {
      if (error.abortData) {
        return [output, error.abortData];
      }
      throw error;
    });
  },
});
