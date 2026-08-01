import { Worker } from 'bullmq';
import messageJob from './message.js';
import { validateEnv } from '../../common/index.js';
import { workerOptions } from '../../common/queue.js';

validateEnv();

const generalMessageWorker = new Worker('general-message', (job) => messageJob(job, 'general'), workerOptions);
const billingMessageWorker = new Worker('billing-message', (job) => messageJob(job, 'billing'), workerOptions);

console.log('Started listening to queue events');

process.on('SIGINT', safeShutdown);
process.on('SIGTERM', safeShutdown);

async function safeShutdown(code: 'SIGINT' | 'SIGTERM') {
    console.log(`Received signal "${code}", stopping queue workers...`);
    await generalMessageWorker.close();
    await billingMessageWorker.close();
    process.exit(0);
};
