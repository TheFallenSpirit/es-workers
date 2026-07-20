import { CronJob } from 'cron';
import { extendDayjs, validateEnv } from '../../common/index.js';
import clearImpairments from './jobs/clearImpairments.js';
import clearSnipes from './jobs/clearSnipes.js';
import startBedtimes from './jobs/startBedtimes.js';
import updateDiscoveryCache from './jobs/updateDiscoveryCache.js';
import warnDueTasks from './jobs/warnDueTasks.js';
import updateDueTasks from './jobs/updateDueTasks.js';
import updateRepeatingTasks from './jobs/updateRepeatingTasks.js';

validateEnv();
extendDayjs();

CronJob.from({
    start: true,
    onTick: clearSnipes,
    cronTime: '*/5 * * * *',
    runOnInit: true,
    onComplete: () => console.log('snipes cron')
});

CronJob.from({
    start: true,
    onTick: startBedtimes,
    cronTime: '*/1 * * * *',
    onComplete: () => console.log('Successfully completed bedtimes cron.')
});

CronJob.from({
    start: true,
    onTick: clearImpairments,
    cronTime: '*/1 * * * *',
    runOnInit: true,
    onComplete: () => console.log('impairment cron')
});

CronJob.from({
    start: true,
    onTick: updateDiscoveryCache,
    cronTime: '0 */12 * * *',
    onComplete: () => console.log('discovery cron')
});

CronJob.from({
    start: true,
    onTick: warnDueTasks,
    cronTime: '*/5 * * * *',
    onComplete: () => console.log('warn due tasks')
});

CronJob.from({
    start: true,
    onTick: updateDueTasks,
    cronTime: '*/1 * * * *',
    onComplete: () => console.log('update due tasks')
});

CronJob.from({
    start: true,
    onTick: updateRepeatingTasks,
    timeZone: 'Etc/UTC',
    cronTime: '0 0 * * *',
    onComplete: () => console.log('update repeating tasks')
});

console.log('Successfully started all cron jobs.');
