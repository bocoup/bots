import Promise from 'bluebird';
import {normalizeResponse} from 'chatter';

export function ask(options = {}) {
  const {
    header,
    headers = header ? [header] : [],
    question,
    onAnswer,
    onExit = () => 'Canceled.',
    strExit = 'exit',
    fmtPrompt = exit => `_Please answer now, or type *${exit}* to cancel._`,
  } = options;
  return {
    messages: [
      ...headers,
      [
        typeof question === 'function' ? question() : question,
        fmtPrompt(strExit),
      ],
    ],
    dialog(answer, ...args) {
      const exits = Array.isArray(strExit) ? strExit : [strExit];
      const exit = exits.find(s => s.toLowerCase() === answer.toLowerCase());
      if (exit) {
        return onExit(exit, ...args);
      }
      return onAnswer(answer, ...args);
    },
  };
}

export function choose(options = {}) {
  const {
    question,
    choices,
    onAnswer,
    fmtIncorrect = answer => `_Sorry, but \`${answer}\` is not a valid response. Please try again._`,
    fmtChoice = (k, v) => `[*${k}*] ${v}`,
  } = options;
  let choiceKeys, choiceMap;
  if (Array.isArray(choices)) {
    choiceKeys = choices.map((_, i) => i + 1);
    choiceMap = choices.reduce((memo, description, i) => {
      memo[i + 1] = description;
      return memo;
    }, {});
  }
  else {
    choiceKeys = Object.keys(choices);
    choiceMap = choices;
  }
  return ask(Object.assign({}, options, {
    question: [
      typeof question === 'function' ? question() : question,
      choiceKeys.map(k => fmtChoice(k, choiceMap[k])),
    ],
    onAnswer(answer, ...args) {
      const choice = choiceKeys.find(k => String(k).toLowerCase() === answer.toLowerCase());
      if (choice) {
        return onAnswer(choice, ...args);
      }
      return choose(Object.assign({}, options, {
        headers: [fmtIncorrect(answer)],
      }));
    },
  }));
}

function nextQuestion([question, ...remain], options, response) {
  if (typeof question === 'function') {
    question = question();
  }
  if (Array.isArray(question)) {
    return nextQuestion([...question, ...remain], options, response);
  }
  else if (!question) {
    if (remain.length === 0) {
      return response;
    }
    return nextQuestion(remain, options, response);
  }
  const _onAnswer = question.onAnswer || options.onAnswer;
  const mergedOptions = Object.assign({}, options, question, {
    onAnswer(...args) {
      return Promise.try(() => _onAnswer(...args))
        .then(resp => nextQuestion(remain, options, resp));
    },
  });
  if (response) {
    mergedOptions.headers = normalizeResponse(response);
  }
  const fn = mergedOptions.choices ? choose : ask;
  return fn(mergedOptions);
}

export function questions(options = {}) {
  const qs = options.questions;
  options = Object.assign({}, options);
  delete options.questions;
  return nextQuestion(Array.isArray(qs) ? qs : [qs], options, null);
}
