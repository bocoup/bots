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

  ask({
    exit = 'exit',
    message = `Type anything. Type *${exit}* to cancel. You have ${timeout} seconds:`,
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

  choose({
    choices,
    exit = 'exit',
    question = `Choose one of the following, or type *${exit}* to cancel. You have ${timeout} seconds:`,
    onMatch,
    oneTimeHeader,
  }) {
    const keys = Object.keys(choices);
    const message = context => [
      this._fnOrValue(question, context),
      ...keys.map(k => `*${k}:* ${choices[k]}`),
    ];
    const onResponse = data => {
      const {message: {text}} = data;
      const match = keys.find(k => k.toLowerCase() === text.toLowerCase());
      if (match) {
        return onMatch(match, data);
      }
      const dialog = new this.constructor(this);
      return dialog.choose({
        choices,
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
}
