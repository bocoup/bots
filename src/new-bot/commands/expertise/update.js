import Promise from 'bluebird';
import moment from 'moment';
import heredoc from 'heredoc-tag';
import {createCommand, createMatcher, createParser} from 'chatter';
import {query} from '../../../lib/db';
import {findExpertiseAndHandleErrors, getIntExpScales, abort} from './lib/query';
import {questions} from './lib/dialog';

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

// =================================
// expertise update <expertise name>
// =================================

function updateExpertiseQuestions(state, header) {
  const {
    scales,
    oldValues,
    newValues,
    userName,
    expertise,
    expertiseName,
    command,
    skippable,
    done,
  } = state;

  const startOver = () => updateExpertiseQuestions(state, '_Starting over._');

  const hasInterestChanged = () => !oldValues || newValues.interest !== oldValues.interest;
  const hasExperienceChanged = () => !oldValues || newValues.experience !== oldValues.experience;

  function getInterestQuestion() {
    return {
      question: `Choose your interest level for ${expertiseName}:`,
      choices: scales.interest,
      onAnswer: answer => {
        newValues.interest = Number(answer);
        return `_You selected *${newValues.interest}* for interest, thanks!_`;
      },
    };
  }

  function getExperienceQuestion() {
    return {
      question: `Choose your experience level for ${expertiseName}:`,
      choices: scales.experience,
      onAnswer: answer => {
        newValues.experience = Number(answer);
        return `_You selected *${newValues.experience}* for experience, thanks!_`;
      },
    };
  }

  function getConfirmNoChangeQuestion() {
    return {
      question: heredoc.trim.unindent`
        Your interest and experience for ${expertiseName} haven't changed! Is this ok?
        > Interest: *${scales.interest[newValues.interest]}*
        > Experience: *${scales.experience[newValues.experience]}*

      `,
      choices: [
        `Continue without making changes.`,
        `No, re-choose interest and experience for ${expertiseName}.`,
      ],
      onAnswer(answer) {
        if (answer === 2) {
          return startOver();
        }
        return done(`_Expertise for *${expertise.expertise}* unchanged._`);
      },
    };
  }

  function getReasonQuestion() {
    if (oldValues) {
      const parts = [];
      if (hasInterestChanged()) { parts.push('interest'); }
      if (hasExperienceChanged()) { parts.push('experience'); }
      const str1 = parts.length === 1 ? 'has' : 'have';
      const str2 = parts.join(' and ');
      return {
        question: `Why ${str1} your ${str2} changed for ${expertiseName}?`,
        onAnswer: answer => {
          newValues.reason = answer;
          return '_Noted!_';
        },
      };
    }
  }

  function getConfirmChangeQuestion() {
    const reason = 'reason' in newValues ? `> Reason: *${newValues.reason}*\n` : '';
    return {
      question: heredoc.trim.unindent`
        You've entered the following for ${expertiseName}. Is this ok?
        > Interest: *${scales.interest[newValues.interest]}*
        > Experience: *${scales.experience[newValues.experience]}*
        ${reason}
      `,
      choices: [
        `Save these changes.`,
        `No, re-choose interest and experience for ${expertiseName}.`,
      ],
      onAnswer(answer) {
        if (answer === 2) {
          return startOver();
        }
        return updateExpertise({userName, expertise, newValues}).then(done);
      },
    };
  }

  return questions({
    header,
    questions: [
      () => getInterestQuestion(),
      () => getExperienceQuestion(),
      () => {
        if (!hasInterestChanged() && !hasExperienceChanged()) {
          return getConfirmNoChangeQuestion();
        }
        return [
          () => getReasonQuestion(),
          () => getConfirmChangeQuestion(),
        ];
      },
    ],
    strExit: skippable ? ['exit', 'skip'] : ['exit'],
    fmtPrompt([exit, skip]) {
      const str1 = skip ? `, type *${skip}* to skip, or` : ' or type';
      return `Please answer${str1} *${exit}* to cancel.`;
    },
    onExit(exit) {
      if (exit === 'skip') {
        return done(`_Skipping ${expertiseName} for now!_`, true);
      }
      return `Canceled, please type \`${command}\` to try again.`;
    },
  });
}

function updateExpertiseDialog({
  userName,
  expertise,
  command,
  oneTimeHeader = null,
  skippable = false,
  done,
}) {
  return Promise.all([
    getIntExpScales(),
    query('expertise_by_bocouper_id', userName, expertise.id),
  ])
  .spread((scales, [oldValues]) => {
    const expertiseName = `*${expertise.expertise}*`;
    const newValues = {};

    let lastUpdated;
    if (oldValues) {
      const formatted = moment.duration(-oldValues.seconds_since_last_update, 'seconds').humanize(true);
      lastUpdated = `_You last updated this expertise *${formatted}*._`;
    }

    const state = {
      scales,
      oldValues,
      newValues,
      userName,
      expertise,
      expertiseName,
      command,
      skippable,
      done,
    };

    return updateExpertiseQuestions(state, [
      oneTimeHeader,
      lastUpdated,
      '',
      `> ${expertiseName} / *${expertise.area}* / *${expertise.type}*`,
      expertise.description && `${expertise.description.replace(/^/gm, '> ')}`,
    ]);
  });
}

export default createCommand({
  name: 'update',
  description: 'Update your interest and experience for the given expertise.',
  usage: '[missing | <expertise name> [interest=<1-5> experience=<1-5>]]',
}, [
  createMatcher({match: 'missing'}, (_, {user}) => {
    return `> update missing for ${user.name} (coming soon)`;
  }),
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
      const command = `expertise update ${search.toLowerCase()}`;
      return updateExpertiseDialog({
        userName,
        expertise,
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
  }),
]);
