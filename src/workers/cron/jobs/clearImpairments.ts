import { CronOnCompleteCallback } from 'cron';
import { redis } from '../../../store/index.js';
import dayjs from 'dayjs';
import { GagI } from '../../../common/schemas/CustomGag.js';
import queueMessage from '../../../common/queue.js';

export default async (done: CronOnCompleteCallback) => {
    const now = dayjs.utc();
    const pipeline = redis.pipeline();
    const impairments = await redis.smembers(`es_impairments:${process.env.DISCORD_APP_ID}`);
    
    for await (const key of impairments) {
        const rawImpairment = await redis.get(key);
        if (!rawImpairment) continue;

        const impairment = JSON.parse(rawImpairment) as ImpairmentOptions;
        if (!impairment.expiresAt || !now.isSameOrAfter(impairment.expiresAt)) continue;

        pipeline.del(key);
        pipeline.srem('es_impairments', key);

        if (!impairment.noAlerts) {
            let location = 'globally';
            if (impairment.guildId) location = `in ${impairment.guildName ?? 'unknown server'}`;
            if (impairment.channelId) location = `in <#${impairment.channelId}>`;

            await queueMessage('general', {
                userId: key.split(':').at(3)!,
                options: {
                    content: `You have been automatically un-${impairment.type === 'gag' ? 'gagged' : 'muted'} ${location}.`
                }
            });
        };
    };

    await pipeline.exec();
    done();
};

export interface ImpairmentOptions {
    type: 'gag' | 'mute';
    gagType?: string;
    guildId?: string;
    noAlerts?: boolean;
    guildName?: string;
    customGag?: GagI;
    expiresAt?: Date;
    channelId?: string;
    impairedBy?: string;
    emojisAllowed?: boolean;
    roleplayEnabled?: boolean;
    reactionsAllowed?: boolean;
    gagMessagePeeking?: boolean;
}
