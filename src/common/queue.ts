import { billingMessageQueue, generalMessageQueue, redis } from '../store/index.js';
import { MessageQueueItem } from './types.js';
import { WorkerOptions } from 'bullmq';

export const workerOptions: WorkerOptions = {
    prefix: 'es_bullmq_queue',
    connection: redis
};

export default async function queueMessage(type: 'general' | 'billing', data: MessageQueueItem) {
    switch (type) {
        case 'general': return queueGeneralMessage(data);
        case 'billing': return queueBillingMessage(data);
    };
};

async function queueGeneralMessage({ userId, options, notificationType }: MessageQueueItem) {
    return await generalMessageQueue.add(
        'direct-message',
        { userId, options, notificationType },
        { removeOnFail: true, removeOnComplete: true }
    );
};

async function queueBillingMessage({ userId, options, notificationType }: MessageQueueItem) {
    return await billingMessageQueue.add(
        'direct-message',
        { userId, options, notificationType },
        { removeOnFail: true, removeOnComplete: true }
    );
};
