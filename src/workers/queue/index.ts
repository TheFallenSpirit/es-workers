import { Worker, WorkerOptions } from 'bullmq';
import { redis } from '../../store/index.js';
import messageJob from './message.js';
import { validateEnv } from '../../common/index.js';

validateEnv();

const queueWorkerOptions: WorkerOptions = {
    prefix: 'es_bullmq_queue',
    connection: redis
};

const generalMessageWorker = new Worker('general-message', (job) => messageJob(job, 'general'), queueWorkerOptions);
const billingMessageWorker = new Worker('billing-message', (job) => messageJob(job, 'billing'), queueWorkerOptions);

console.log('Started listening to queue events');

process.on('SIGINT', safeShutdown);
process.on('SIGTERM', safeShutdown);

async function safeShutdown(code: 'SIGINT' | 'SIGTERM') {
    console.log(`Received signal "${code}", stopping queue workers...`);
    await generalMessageWorker.close();
    await billingMessageWorker.close();
    process.exit(0);
};
