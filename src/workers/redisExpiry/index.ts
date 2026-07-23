import bedtime from './keys/bedtime.js';
import { validateEnv } from '../../common/index.js';
import { redis } from '../../store/index.js';

validateEnv();

const channelName = `__keyevent@${redis.options.db}__:expired`;
await redis.subscribe(channelName);

redis.on('message', async (channel, message) => {
    if (channel !== channelName) return;

    switch (message.split(':').at(0) ?? '') {
        case 'es_bedtime': await bedtime(message); break;
    };
});

console.log('Started listening to expiry events.');
