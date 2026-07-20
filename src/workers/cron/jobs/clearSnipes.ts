import { CronOnCompleteCallback } from 'cron';
import dayjs from 'dayjs';
import { redis } from '../../../store/index.js';

export default async (done: CronOnCompleteCallback) => {
    const now = dayjs.utc();
    const pipeline = redis.pipeline();
    const snipeKeys = await redis.smembers(`es_snipes`);

    for await (const snipeKey of snipeKeys) {
        const snipes = await redis.lrange(snipeKey, 0, -1);
        for (const snipe of snipes) if (now.isSameOrAfter(JSON.parse(snipe).expiresAt)) {
            pipeline.lrem(snipeKey, 0, snipe);
        };
    };

    await pipeline.exec();
    done();
};
