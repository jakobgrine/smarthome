const path = require('path');
const fs = require('fs');
const {
    IntervalBasedCronScheduler,
    parseCronExpression
} = require('cron-schedule');
const config = require('./config.json');

const timeToCron = time => {
    const [hour, minute] = time.split(':');
    return parseCronExpression(`${minute} ${hour} * * *`);
};

class CronScheduler {
    filename = 'timers.json';

    timers = {};
    crons = {};

    scheduler = new IntervalBasedCronScheduler(10 * 1000);

    // callback: (timer) => void
    constructor(callback) {
        this.callback = callback;

        this.timers = this.readData();
        Object.values(this.timers).forEach(timer => this.addTimer(timer));
    }

    readData() {
        return require('.' + path.sep + this.filename);
    }

    writeData() {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(this.timers, null, 4);
            fs.writeFile(this.filename, json, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    addTimer(timer) {
        this.timers[timer.id] = timer;
        this.writeData();

        try {
            this.scheduler.unregisterTask(this.crons[timer.id]);
        } catch {}

        if (timer.enabled) {
            this.crons[timer.id] = this.scheduler.registerTask(
                timeToCron(timer.time),
                () => this.callback(timer));
        }
    }

    removeTimer(id) {
        delete this.timers[id];
        this.writeData();

        try {
            this.scheduler.unregisterTask(this.crons[id]);
        } catch {}
    }
}

module.exports = {
    CronScheduler,
};

