import {CronJob} from 'cron';
import heredoc from 'heredoc-tag';

// https://github.com/ncb000gt/node-cron#available-cron-patterns
export default class Scheduler {
  constructor(jobs = []) {
    this.jobs = jobs;
  }

  wrapOnTick(fn) {
    return () => fn(this.bot);
  }

  add(cronTime, onTick) {
    try {
      const job = new CronJob({
        cronTime,
        timeZone: 'America/New_York',
        onTick: this.wrapOnTick(onTick),
        start: false,
      });
      this.jobs.push(job);
    }
    catch (error) {
      console.error(heredoc.trim.oneline`
        Invalid cron pattern "${cronTime}".
        See https://goo.gl/H8az8w for cron pattern help.
      `);
    }
  }

  start(bot) {
    console.log(`Scheduler starting ${this.jobs.length} job(s).`);
    this.bot = bot;
    this.jobs.forEach(job => job.start());
  }
}
