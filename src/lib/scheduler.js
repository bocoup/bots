import {CronJob} from 'cron';

// https://github.com/ncb000gt/node-cron#available-cron-patterns
export default class Scheduler {
  constructor(jobs = []) {
    this.jobs = jobs;
  }

  wrapOnTick(fn) {
    return () => fn.call(this.bot);
  }

  add(cronTime, onTick) {
    const job = new CronJob({
      cronTime,
      timeZone: 'America/New_York',
      onTick: this.wrapOnTick(onTick),
      start: false,
    });
    this.jobs.push(job);
  }

  start(bot) {
    console.log(`Scheduler starting ${this.jobs.length} job(s).`);
    this.bot = bot;
    this.jobs.forEach(job => job.start());
  }
}
