import Promise from 'bluebird';
import Dialog from './dialog';

export default class Conversation {
  constructor() {
    this.dialog = null;
  }
  hasDialog() {
    return Boolean(this.dialog && !this.dialog.isDone());
  }
  handleMessage(data, fn) {
    return Promise.try(() => {
      return this.hasDialog() ? this.dialog.handleResponse(data) : fn(data);
    })
    .then(result => {
      if (result instanceof Dialog) {
        this.dialog = result;
        result = null;
      }
      return result;
    });
  }
}
