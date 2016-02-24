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

  _ask({
    message = ({exit, timeout}) => `Type anything. Type *${exit}* to cancel. You have ${timeout} seconds:`,
    exit = 'exit',
    onResponse,
    oneTimeHeader,
  }) {
    this._start();
    const context = Object.assign({exit}, this);
    this.message = [
      ...(oneTimeHeader ? [this._fnOrValue(oneTimeHeader, context), ''] : []),
      this._fnOrValue(message, context),
    ];
    this.handler = data => {
      const {message: {text}} = data;
      if (text.toLowerCase() === exit.toLowerCase()) {
        return this._fnOrValue(this.onCancel);
      }
      return onResponse(data);
    };
    return this;
  }

  _choose({
    choices,
    question = ({exit, timeout}) => `Choose one of the following, or type *${exit}* to cancel. You have ${timeout} seconds:`,
    exit = 'exit',
    onMatch,
    oneTimeHeader,
  }) {
    let keys;
    if (Array.isArray(choices)) {
      const tmp = {};
      keys = choices.map((choice, i) => {
        tmp[++i] = choice;
        return i;
      });
      choices = tmp;
    }
    else {
      keys = Object.keys(choices);
    }
    const message = context => [
      this._fnOrValue(question, context),
      ...keys.map(k => `[*${k}*] ${choices[k]}`),
    ];
    const onResponse = data => {
      const {message: {text}} = data;
      const match = keys.find(k => String(k).toLowerCase() === text.toLowerCase());
      if (match) {
        return onMatch(match, data);
      }
      return this.choose({
        choices,
        question,
        exit,
        onMatch,
        oneTimeHeader: `Sorry, but \`${text}\` is not a valid response. Please try again.`,
      });
    };
    return this.ask({
      exit,
      message,
      onResponse,
      oneTimeHeader,
    });
  }

  _multi(args, apiMethod, responseMethod) {
    const arr = Array.isArray(args[0]) ? Array.from(args[0]) : args;
    let lastResult;
    const next = () => {
      const item = arr.shift();
      if (!item) {
        return lastResult;
      }
      const _responseMethod = item[responseMethod];
      const options = Object.assign({}, item);
      if (lastResult) {
        options.oneTimeHeader = lastResult;
      }
      options[responseMethod] = (..._args) => {
        lastResult = _responseMethod(..._args);
        return next();
      };
      return this[apiMethod](options);
    };
    return next();
  }

  ask(...args) {
    return this._multi(args, '_ask', 'onResponse');
  }

  choose(...args) {
    return this._multi(args, '_choose', 'onMatch');
  }
}
