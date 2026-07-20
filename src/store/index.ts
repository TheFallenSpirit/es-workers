import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { connect } from 'mongoose';
import { MessageQueueItem } from '../common/types.js';

export const redis = new Redis(
    process.env.REDIS_URL ?? '',
    { maxRetriesPerRequest: null }
);

export const generalMessageQueue = new Queue<MessageQueueItem, any, string>('general-message', {
    prefix: 'es_bullmq_queue',
    connection: redis
});

export const billingMessageQueue = new Queue<MessageQueueItem, any, string>('billing-message', {
    prefix: 'es_bullmq_queue',
    connection: redis
});

await generalMessageQueue.setGlobalRateLimit(1, 1000);
await billingMessageQueue.setGlobalRateLimit(1, 1000);

await connect(process.env.MONGO_URL ?? '', { dbName: 'bot' })
.then(() => console.log('Successfully connected to MongoDB.'))
.catch(() => console.error('Failed to connect to MongoDB!'));

export function reviver(_key: string, value: any) {
    if (typeof value === 'object' && value !== null) if (value.dataType === 'Map') return new Map(value.value);
    return value;
};

export function replacer(_key: string, value: any) {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Map) return { dataType: 'Map', value: [...value]};
    return value;
};
