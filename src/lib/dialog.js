import Promise from 'bluebird';

export default class Dialog {
  constructor({channel, timeout, onTimeout, onCancel}) {
    this.channel = channel;
    this.timeout = timeout || 30;
    this.onTimeout = onTimeout || 'Dialog timeout, please try again.';
    this.onCancel = onCancel || 'Dialog canceled.';
    this._start();
  }

  isDone() {
    return Boolean(this._done);
  }

  _fnOrValue(val, ...args) {
    return typeof val === 'function' ? val(...args) : val;
  }

  _stop() {
    this._done = true;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      delete this._timeoutId;
    }
  }

  _start() {
    this._stop();
    this._done = false;
    this._timeoutId = setTimeout(() => this.cancel(), this.timeout * 1000);
  }

  cancel() {
    this._stop();
    this.channel.send(this._fnOrValue(this.onTimeout));
  }

  handleMessage(data) {
    this._stop();
    return this.handler(data);
  }

  // Ask a question, get an arbitrary text answer.
  ask({
    question = `Type anything.`,
    prompt = ({exit, timeout}) => `_You have ${timeout} seconds to answer. Type *${exit}* to cancel._`,
    exit = 'exit',
    onResponse,
    oneTimeHeader,
  }) {
    this._start();
    const context = Object.assign({exit}, this);
    this.message = [
      ...(oneTimeHeader ? [this._fnOrValue(oneTimeHeader, context), ''] : []),
      this._fnOrValue(question, context),
      '',
      this._fnOrValue(prompt, context),
    ];
    this.handler = data => {
      const {message: {text}} = data;
      if (text.toLowerCase() === exit.toLowerCase()) {
        return this._fnOrValue(this.onCancel);
      }
      return onResponse(text, data);
    };
    return this;
  }

  // Ask a question, choices (list or array) are displayed in a list for the
  // user. Answers will be validated against object keys/array indices. If an
  // invalid choice is entered, the question will be re-displayed. Note that
  // array indices are displayed (and passed into onMatch) starting at 1.
  choose({
    choices,
    question = `Choose one of the following:`,
    prompt = null,
    exit = null,
    onMatch,
    onError = text => `_Sorry, but \`${text}\` is not a valid response. Please try again._`,
    oneTimeHeader,
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
    const _question = context => [
      this._fnOrValue(question, context),
      '',
      ...keys.map(k => `[*${k}*] ${choices[k]}`),
    ];
    const onResponse = (text, data) => {
      const match = keys.find(k => String(k).toLowerCase() === text.toLowerCase());
      if (match) {
        return onMatch(match, data);
      }
      return this.choose({
        choices,
        question,
        prompt,
        exit,
        onMatch,
        onError,
        oneTimeHeader: this._fnOrValue(onError, text, data),
      });
    };
    const options = {
      question: _question,
      onResponse,
      oneTimeHeader,
    };
    if (prompt) { options.prompt = prompt; }
    if (exit) { options.exit = exit; }
    return this.ask(options);
  }

  // Wrapper around single-question methods. Pass in a single question, an
  // array of questions, or any number of question arguments.
  //
  // Questions may be a question object, a function that returns a question
  // object, or a function that returns a promise that resolves to a question
  // object.
  //
  // Response handlers may return a string to appear as the oneTimeHeader for
  // the next question, or the final text after all questions. Alternately,
  // response handlers may return a question object or array of question objects
  // or a promise that resolves to either.
  questions(...args) {
    // Use the first argument if it's an array, otherwise use all arguments.
    const questions = Array.isArray(args[0]) ? Array.from(args[0]) : args;

    // Determine if the given value is a "question" object. This could perhaps
    // be more robust.
    const isQuestion = q => q && q.question;

    // Result might be a promise, so resolve it before anything else.
    const next = _result => Promise.resolve(_result)
    .then(result => {
      // If result is an array of questions or a single question, add them/it
      // to the beginning of the list.
      if (Array.isArray(result) && result.every(isQuestion)) {
        questions.unshift(...result);
        result = null;
      }
      else if (isQuestion(result)) {
        questions.unshift(result);
        result = null;
      }
      // The next "question" might be a question object, a function that returns
      // a question object, a promise that resolves to a question object, or a
      // function that returns a promise that resolves to a question object.
      return Promise.props({
        question: questions.length > 0 && this._fnOrValue(questions.shift()),
        result,
      });
    })
    .then(({question, result}) => {
      // There's no question. If it's because the question was empty or a
      // question promise resolved to nothing, get the next question. If it's
      // because there were no more questions, just return the result.
      if (!question) {
        return questions.length === 0 ? result : next(result);
      }
      // Guess which method to call, based on the shape of the question object.
      let apiMethod, responseMethod;
      if (question.choices) {
        responseMethod = 'onMatch';
        apiMethod = 'choose';
      }
      else {
        responseMethod = 'onResponse';
        apiMethod = 'ask';
      }
      const options = Object.assign({}, question);
      // Pass any "result" the previous question yielded into the next question
      // as a oneTimeHeader.
      if (result) {
        options.oneTimeHeader = result;
      }
      // Ensure the next question is shown after the current one is completed.
      // Pass any result (or promised result) from the current question's
      // response handler into the next question.
      const _responseMethod = question[responseMethod];
      options[responseMethod] = (..._args) => Promise.resolve(_responseMethod(..._args)).then(next);
      // Create and return the dialog.
      return this[apiMethod](options);
    });

    // Start the question chain.
    return next();
  }
}
