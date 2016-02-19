import Promise from 'bluebird';

export default class Dialog {
  constructor({channel, timeout, onTimeout, onCancel}) {
    this.channel = channel;
    this.timeout = timeout || 30000;
    this.onTimeout = onTimeout || 'Dialog timeout, please try again.';
    this.onCancel = onCancel || 'Dialog canceled.';
    this.start();
  }
  isDone() {
    return Boolean(this._done);
  }
  stop() {
    this._done = true;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      delete this._timeoutId;
    }
  }
  start() {
    this.stop();
    this._done = false;
    this._timeoutId = setTimeout(() => this.cancel(), this.timeout);
  }
  cancel() {
    this.stop();
    const {onTimeout} = this;
    this.channel.send(typeof onTimeout === 'function' ? onTimeout() : onTimeout);
  }
  ask(message, fn) {
    this.start();
    this.message = message;
    this.handler = ({message}) => fn(message.text);
    return this;
  }
  choose({choices, exit = 'exit', onMatch, oneTimeHeader}) {
    this.start();
    const keys = Object.keys(choices);
    this.message = [
      ...(oneTimeHeader ? [oneTimeHeader, ''] : []),
      `Choose one of the following, or type *${exit}* to cancel:`,
      ...keys.map(k => `*${k}:* ${choices[k]}`),
    ];
    this.handler = ({message}) => {
      let {text} = message;
      if (text.toLowerCase() === exit.toLowerCase()) {
        const {onCancel} = this;
        return typeof onCancel === 'function' ? onCancel() : onCancel;
      }
      const match = keys.find(k => k.toLowerCase() === text.toLowerCase());
      if (match) {
        return onMatch(match);
      }
      const dialog = new this.constructor(this);
      return dialog.choose({
        choices,
        exit,
        onMatch,
        oneTimeHeader: `Sorry, but \`${text}\` is not a valid response. Please try again.`,
      });
    };
    return this;
  }
  handleMessage(data) {
    this.stop();
    return this.handler(data);
  }
}
