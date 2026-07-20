import { seconds } from 'itty-time';
import CustomGag, { GagI } from '../common/schemas/CustomGag.js';
import { redis, replacer, reviver } from './index.js';

export async function getCustomGag(gagId: string): Promise<GagI | undefined> {
    const redisGag = await redis.get(`es_custom_gag:${gagId}`);
    if (redisGag) return JSON.parse(redisGag, reviver) as GagI;

    const dbGag = await CustomGag.findById(gagId);
    if (!dbGag) return;

    const gag = dbGag.toObject();
    await redis.set(`es_custom_gag:${gagId}`, JSON.stringify(gag, replacer), 'EX', seconds('1 month'));
    return gag;
};
