import { Worker } from 'bullmq';
import Client from './client.js';
import { extendDayjs, validateEnv } from '../../common/index.js';
import { workerOptions } from '../../common/queue.js';
import seyfertConfig from './seyfert.config.mjs';
import { GatewayDispatchEvents, GatewayDispatchPayload } from 'seyfert';
import middlewares from './middlewares/index.js';
import plugins from './plugins.js';
import dayjs from 'dayjs';
import { onAfterRun, onOptionsError } from './defaults.js';

validateEnv();
extendDayjs();
const dev = process.argv.includes('--dev');

export const client = new Client({
    getRC: () => seyfertConfig,
    plugins,
    commands: {
        reply: () => true,
        prefix: () => [dev ? '.est' : '.es'],
        defaults: { onAfterRun, onOptionsError }
    },
    allowedMentions: { parse: [], replied_user: true },
    globalMiddlewares: ['permissions']
});

client.setServices({
    cache: { disabledCache: true },
    middlewares
});

await client.start({}, false);

const worker = new Worker<GatewayDispatchPayload>('gateway-event', async (job) => {
    if (job.data.t !== GatewayDispatchEvents.MessageCreate) return await job.remove() ?? null;

    const now = dayjs.utc();
    if (now.diff(job.data.d.timestamp, 'minutes') > 2) return await job.remove() ?? null;

    client.packet(0, job.data);
}, workerOptions);

worker.cancelAllJobs();
worker.on('error', client.logger.fatal);
worker.on('ready', () => client.events.runCustom('queueWorkerReady'));

process.on('SIGINT', safeShutdown);
process.on('SIGTERM', safeShutdown);

async function safeShutdown(code: 'SIGINT' | 'SIGTERM') {
    console.log(`Received signal "${code}", stopping admin client...`);
    await worker.close(code === 'SIGTERM');
    process.exit(0);
};
