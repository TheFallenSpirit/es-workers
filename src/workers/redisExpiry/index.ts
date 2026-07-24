import bedtime from './keys/bedtime.js';
import { validateEnv } from '../../common/index.js';
import { Redis } from 'ioredis';

validateEnv();

const redis = new Redis(process.env.REDIS_URL ?? '');
await redis.config('SET', 'notify-keyspace-events', 'Ex');

const channelName = `__keyevent@${redis.options.db}__:expired`;
await redis.subscribe(channelName);

redis.on('message', async (channel, message) => {
    if (channel !== channelName) return;

    switch (message.split(':').at(0) ?? '') {
        case 'es_bedtime': await bedtime(message); break;
    };
});

console.log('Started listening to expiry events.');
