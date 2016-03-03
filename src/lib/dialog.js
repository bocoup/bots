import Promise from 'bluebird';

export default class Dialog {
  constructor({postMessage, timeout, onTimeout, onCancel, questions}) {
    this.postMessage = postMessage;
    this.timeout = timeout || 30;
    this.onTimeout = onTimeout || 'Dialog timeout, please try again.';
    this.onCancel = onCancel || 'Dialog canceled.';
    // This property will be defined by the ask method and its wrapper methods.
    this._handler = null;
    if (questions) {
      return this.questions(questions);
    }
  }

  // Is this dialog done?
  isDone() {
    return Boolean(this._done);
  }

  // If a value is a function, invoke it and return its result, otherwise just
  // return the value. Pass this / additional arguments into the function.
  _fnOrValue(val, ...args) {
    return typeof val === 'function' ? val.apply(this, args) : val;
  }

  // Set the dialog's state to "done" and stop the timeout counter.
  _stop() {
    this._done = true;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      delete this._timeoutId;
    }
  }

  // Set the dialog's state to "not done" and start the timeout counter.
  _start(timeout) {
    if (!timeout) {
      timeout = this.timeout;
    }
    this._stop();
    this._done = false;
    this._timeoutId = setTimeout(() => this._timeout(), timeout * 1000);
  }

  // Timeout reached. Stop the dialog and complain about timing out.
  _timeout() {
    this._stop();
    this.say(this.onTimeout);
  }

  // Public API to the response handler registered by the ask method and its
  // wrapper methods.
  handleResponse(data) {
    // Since an answer was received, stop the dialog / timeout counter.
    this._stop();
    if (!this._handler) {
      throw new Error('No registered response handler. Was a question asked?');
    }
    // Actually process the message.
    const result = this._handler(data);
    // Ensure the dialog can only be used once.
    this._handler = null;
    return result;
  }

  // Just say the specified text. If followed by another message or question,
  // should be chained like say(message).then(nextThing) to ensure the proper
  // delay exists between messages.
  say(message) {
    // Handle {message: '...'} format
    if (message && message.message) {
      message = message.message;
    }
    if (message) {
      this.postMessage(this._fnOrValue(message, this));
    }
    // Force a small delay after this so that any message or question following
    // this one doesn't appear out of order.
    return Promise.delay(100);
  }

  // Ask a question, await an arbitrary text answer.
  ask({
    question = `Type anything.`,
    prompt = ({exit, timeout}) => `_You have ${timeout} seconds to answer. Type *${exit}* to cancel._`,
    exit = 'exit',
    timeout,
    onResponse,
  }) {
    // Set the dialog's state to "not done" and start the timeout counter.
    this._start(timeout);
    const context = Object.assign({}, this, {exit});
    if (timeout) {
      context.timeout = timeout;
    }
    // Register a handler to process the user response.
    this._handler = data => {
      const {message: {text}} = data;
      if (text.toLowerCase() === exit.toLowerCase()) {
        return this._fnOrValue(this.onCancel);
      }
      return onResponse(text, data);
    };
    // Display the question message.
    this.say([
      this._fnOrValue(question, context),
      '',
      this._fnOrValue(prompt, context),
    ]);
    return this;
  }

  // Ask a question, choices (list or array) are displayed in a list for the
  // user. Answers will be validated against object keys/array indices. If an
  // invalid choice is entered, the question will be re-displayed. Note that
  // array indices are displayed (and passed into onMatch) starting at 1.
  choose({
    question = `Choose one of the following:`,
    choices,
    prompt,
    exit,
    timeout,
    onMatch,
    onError = text => `_Sorry, but \`${text}\` is not a valid response. Please try again._`,
  }) {
    let keys;
    if (Array.isArray(choices)) {
      // Change from 0-indexed to 1-indexed. It makes the choices look prettier.
      keys = choices.map((c, i) => i + 1);
      choices = [null].concat(choices);
    }
    else {
      keys = Object.keys(choices);
    }

    const ask = () => this.ask({
      question: context => [
        this._fnOrValue(question, context),
        '',
        ...keys.map(k => `[*${k}*] ${choices[k]}`),
      ],
      prompt,
      exit,
      timeout,
      onResponse: (text, data) => {
        const match = keys.find(k => String(k).toLowerCase() === text.toLowerCase());
        if (match) {
          return onMatch(match, data);
        }
        return this.say(this._fnOrValue(onError, text, data)).then(ask);
      },
    });

    return ask();
  }

  // Determine if the given value is a "question" object or a function that
  // could return a question object. This could perhaps be more robust.
  isMessage(q) {
    return typeof q === 'string' || q && q.message;
  }
  isQuestion(q) {
    return this.isMessage(q) || q && q.question;
  }
  isQuestionOrFunction(q) {
    return this.isQuestion(q) || typeof q === 'function';
  }
  // Decide which method to call, based on the shape of the question object.
  getQuestionMethods(q) {
    let askMethod, responseMethod;
    if (this.isMessage(q)) {
      askMethod = 'say';
    }
    else if (q.choices) {
      askMethod = 'choose';
      responseMethod = 'onMatch';
    }
    else {
      askMethod = 'ask';
      responseMethod = 'onResponse';
    }
    return {askMethod, responseMethod};
  }

  // Wrapper around single-question methods. Pass in an array of questions or
  // one or more question arguments.
  //
  // Each "question" may be:
  // * A String message or message object, to be passed to this.say()
  // * A question object, to be passed to this.ask() or this.choose()
  // * An array of question objects or functions
  // * A promise that returns any of the preceding
  // * A function that returns any of the preceding
  // * A Dialog instance (in which case, the current list of questions will
  //   be replaced with the new dialog)
  //
  // Additionally, response handler methods may return any of the preceding,
  // except for the function. It's assumed that any logic can be executed in
  // the response handler method.
  //
  // Message objects look like:
  // * {message: String|Array}
  //
  // Question objects look like:
  // * {question: String|Array, onResponse: Function, ...}
  // * {question: String|Array, choices: Object|Array, onMatch: Function, ...}
  //
  questions(...args) {
    // Use the first argument if it's an array, otherwise use all arguments.
    const questions = Array.isArray(args[0]) ? Array.from(args[0]) : args;

    /* eslint no-use-before-define: 0 */

    // If a previous question response handler returned a dialog, return it
    // outright. Otherwise process it as a question, array of questions, etc.
    const handleDialog = result => {
      if (result instanceof Dialog) {
        return result;
      }
      return Promise.resolve(result)
      .then(handleResult)
      .then(handleQuestion);
    };

    // If a previous question response handler returned a question or array of
    // questions, add them to the front of the question array, otherwise error.
    const handleResult = result => {
      if (Array.isArray(result) && result.every(this.isQuestionOrFunction, this)) {
        questions.unshift(...result);
      }
      else if (this.isQuestionOrFunction(result)) {
        questions.unshift(result);
      }
      else if (result) {
        throw new Error(`Unknown question format: ${JSON.stringify(result)}`);
      }
      // Get the next question, if one exists.
      return this._fnOrValue(questions.shift());
    };

    // Process the next question.
    const handleQuestion = question => {
      // If there is no question, either show the next one or end.
      if (!question) {
        return questions.length > 0 ? next() : null;
      }
      // If the question isn't a question, start over.
      else if (!this.isQuestion(question)) {
        return next(question);
      }

      const {askMethod, responseMethod} = this.getQuestionMethods(question);
      // Pass any result (or promised result) from the question response
      // handler forward, to be handled.
      if (responseMethod) {
        const _responseMethod = question[responseMethod];
        const options = Object.assign({}, question, {
          [responseMethod]: (...a) => Promise.resolve(_responseMethod(...a)).then(next),
        });
        return this[askMethod](options);
      }
      // No response method, so just say the message and move to the next.
      return this[askMethod](question).then(next);
    };

    // Result might be a promise, so resolve it before anything else.
    const next = result => Promise.resolve(result).then(handleDialog);

    // Start with the questions!
    return next();
  }
}
