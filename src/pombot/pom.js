import states from './states';

export default class Pom {
  constructor(options = {}) {
    this.state = states.NOT_RUNNING;
    this.maxSeconds = options.maxMinutes * 60000;
    this.warningSeconds = options.warningMinutes * 60000;
    this.onDoneCallback = options.onDoneCallback;
    this.onWarningCallback = options.onWarningCallback;
    this.onWarningId = null;
    this.onDoneId = null;
    this.startTime = null;
  }

  /* starts a pom and its timers */
  start() {
    this.state = states.RUNNING;
    this.startTime = new Date();

    // set timers
    this.onDoneId = setTimeout(this.onDoneCallback, this.maxSeconds);
    this.onWarningId = setTimeout(this.onWarningCallback, this.maxSeconds - this.warningSeconds);
  }

  /* stops a pom and its timers */
  stop() {
    this.state = states.NOT_RUNNING;
    this.startTime = null;
    clearTimeout(this.onWarningId);
    clearTimeout(this.onDoneId);
  }

  /* returns the time that has elapsed in milliseconds */
  get timeElapsed() {
    if (this.state === states.RUNNING) {
      return new Date() - this.startTime;
    }
  }

  /* returns the time left in milliseconds */
  get timeLeft() {
    if (this.state === states.RUNNING) {
      return this.maxSeconds - this.timeElapsed;
    }
  }

  /* returns the time given in minutes */
  getMinutes(milliseconds) {
    return (milliseconds / 60000).toFixed(1);
  }

}
