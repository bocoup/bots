import Promise from 'bluebird';
import heredoc from 'heredoc-tag';

import {parseArgs} from '../../lib/args';
import {query} from '../../lib/db';
import Dialog from '../../lib/dialog';

const description = {
  brief: 'Show your expertise.',
  full: `*Experience:*
\`1\` - I have no experience with this skill.
\`2\` - I feel comfortable using this skill.
\`3\` - I feel comfortable being lead for this skill in a consulting gig.
*Interest:*
\`1\` - I have no interest in this skill.
\`2\` - I am interested in learning more about this skill.
\`3\` - I am interested in becoming an expert in this skill.`,
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

addCommand('dialog2', {
  description: 'A quick test of the dialog system.',
  fn() {
    const questions = [
      'Favorite color?',
      'Favorite number?',
      'Cats or dogs?',
    ];
    const results = [];

    const dialog = new Dialog({
      channel: this.channel,
      timeout: 30,
      onTimeout: 'Timed out, please type `expertise dialog2` to try again.',
      onCancel: () => {
        return `Canceled (${results.length} responses so far), please type \`expertise dialog2\` to try again.`;
      },
    });

    const nextQuestion = oneTimeHeader => {
      return dialog.ask({
        oneTimeHeader,
        message: questions[results.length],
        onResponse(response) {
          results.push(response);
          if (results.length === questions.length) {
            return [
              `All done! Your responses were:`,
              ...results.map((r, i) => `*${questions[i]}* ${r}`),
            ];
          }
          return nextQuestion();
        },
      });
    };

    return nextQuestion(({exit, timeout}) => heredoc.oneline.trim`
      *I'm going to ask you ${questions.length} questions.
      Type _${exit}_ to cancel. You have ${timeout} seconds to answer each question.*
    `);
  },
});

addCommand('dialog', {
  description: 'A quick test of the dialog system.',
  fn() {
    const results = [];

    const dialog = new Dialog({
      channel: this.channel,
      timeout: 30,
      onTimeout: 'Timed out, please type `expertise dialog` to try again.',
      onCancel: () => {
        const resultsTxt = results.length > 0 ? ` (responses so far were \`${results.join(', ')}\`)` : '';
        return `Canceled${resultsTxt}, please type \`expertise dialog\` to try again.`;
      },
    });

    const nextQuestion = oneTimeHeader => {
      return dialog.choose({
        oneTimeHeader,
        question: ({exit, timeout}) => `Make a choice, or type *${exit}* to cancel. You have ${timeout} seconds:`,
        choices: {
          A: 'the first choice',
          B: 'the second choice',
          C: 'the third choice',
        },
        onMatch(match) {
          results.push(match);
          if (results.length === 3) {
            return `All done! Your responses were \`${results.join(', ')}\`.`;
          }
          return nextQuestion(`You responded \`${match}\`, thanks!`);
        },
      });
    };

    return nextQuestion(`*I'm going to ask you three questions.*`);
  },
});

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

addCommand('update', {
  description: 'Update your interest and experience for the given expertise.',
  usage: command => `${command} <expertise> interest=<1-3> experience=<1-3>`,
  fn(...args) {
    const parsed = parseArgs(args, {
      experience: Number,
      interest: Number,
      // user: String, // Uncomment to allow specifying user when testing
    });
    const user = getName(parsed.options.user) || this.user.name;
    const newValues = parsed.options;
    const search = parsed.remain.join(' ');
    const output = [...parsed.errors];

    if (!search) {
      return this.usage();
    }

    return findExpertiseAndHandleErrors(search).then(results => {
      const {match} = results;
      output.push(results.output);

      if (!newValues.experience || !newValues.interest) {
        throw abort(`_Please specify both experience and interest._`, this.usage());
      }

      // Old values will be used to show changes at the end. This has to be done
      // before updating the database!
      const oldValues = query('expertise_by_bocouper_id', user, match.id).then(r => r[0]);
      return Promise.props({
        match,
        oldValues,
      });
    })
    .then(({match, oldValues}) => {
      // Actually make the change in the database.
      const updatePromise = query('update_expertise', user, match.id,
                                  newValues.experience, newValues.interest, '');
      return Promise.props({
        oldValues,
        // We need to wait for the update to resolve, but do we care about the result?
        updatePromise,
      });
    })
    .then(({oldValues}) => {
      // Show a summary of the changes.
      const summary = ['interest', 'experience'].map(prop => {
        const name = prop[0].toUpperCase() + prop.slice(1).toLowerCase();
        if (!oldValues) {
          return `${name} set to ${newValues[prop]}.`;
        }
        else if (newValues[prop] === oldValues[prop]) {
          return `${name} unchanged at ${newValues[prop]}.`;
        }
        return `${name} changed from ${oldValues[prop]} to ${newValues[prop]}.`;
      }).join(' ');
      return [
        `Done! ${summary}`,
        `View your expertise list with \`${this.command} me\`.`,
      ];
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
