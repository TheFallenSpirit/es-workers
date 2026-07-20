import { CronOnCompleteCallback } from 'cron';
import { ChainableCommander } from 'ioredis';
import { redis } from '../../../store/index.js';
import Profile from '../../../common/schemas/Profile.js';
import dayjs from 'dayjs';
import { BedtimeDay } from '../../../common/schemas/profile/Bedtime.js';
import { GagI } from '../../../common/schemas/CustomGag.js';
import { getCustomGag } from '../../../store/gag.js';
import queueMessage from '../../../common/queue.js';
import { ImpairmentOptions } from './clearImpairments.js';

export default async (done: CronOnCompleteCallback) => {
    const now = dayjs.utc();
    const day = now.isoWeekday() as BedtimeDay;
    const minute = (now.hour() * 60) + now.minute();
    const pipeline = redis.pipeline();

    const profiles = await Profile.find(
        { 'bedtime.schedule': { $elemMatch: { days: day, start: minute } } },
        { _id: 1, user: 1, bedtime: 1 }
    ).lean();

    for await (const profile of profiles) {
        const schedule = profile.bedtime?.schedule?.find(({ days, start }) => days.includes(day) && start === minute);
        if (!schedule) continue;

        let customGag: GagI | undefined;
        const lines = ['Your bedtime has started'];
        const endDate = now.add(schedule.duration, 'm');

        const voiceBlocked = profile.bedtime?.allowVoice !== true;
        const impairmentType = profile.bedtime?.impairmentType ?? 'mute';
        const mentionsBlocked = profile.bedtime?.allowMentions !== true;

        if (impairmentType === 'gag' && profile.bedtime?.gagType?.startsWith('custom:')) {
            const gagId = profile.bedtime.gagType.split(':').at(-1)!;
            customGag = await getCustomGag(gagId);
        };

        switch (impairmentType) {
            case 'mute':
            case 'timeout':
                lines.push(' and you have been automatically muted.');
                await setImpairment(profile.user, pipeline, {
                    type: 'mute',
                    noAlerts: true,
                    expiresAt: endDate.toDate()
                });
                break;

            case 'gag':
                lines.push(' and you have been automatically gagged.');
                await setImpairment(profile.user, pipeline, {
                    type: 'gag',
                    gagType: profile.bedtime?.gagType,
                    noAlerts: true,
                    customGag,
                    expiresAt: endDate.toDate()
                });
                break;

            default:
                lines.push('.');
                break;
        };

        if (voiceBlocked && mentionsBlocked) lines.push(
            ' You are no longer allowed to join VCs or be pinged/mentioned until your bedtime ends.'
        ); else if (mentionsBlocked) lines.push(
            ' You are no longer allowed to be pinged/mentioned until your bedtime ends.'
        ); else if (voiceBlocked) {
            ' You are no longer allowed to join VCs until your bedtime ends.'
        };

        const endDateTimestamp = endDate.unix();
        lines.push(` Your bedtime will end at <t:${endDateTimestamp}:t> [<t:${endDateTimestamp}:R>]`);
        await queueMessage('general', { userId: profile.user, options: { content: lines.join('') } });

        pipeline.set(`es_bedtime:${profile.user}`, JSON.stringify({
            end: endDate.toISOString(),
            allowVoice: !voiceBlocked,
            allowMentions: !mentionsBlocked
        }), 'EX', schedule.duration * 60);
    };

    await pipeline.exec();
    done();
};

function setImpairment(userId: string, pipeline: ChainableCommander, opts: ImpairmentOptions) {
    let key = `es_impairment${opts.expiresAt ? '_expr' : ''}:${opts.type}:${process.env.DISCORD_APP_ID}:${userId}:`;
    key = key + `${opts.guildId ?? 'global'}:${opts.guildId && opts.channelId ? `${opts.channelId}` : 'all'}`;
    pipeline.set(key, JSON.stringify(opts));
    pipeline.sadd(`es_impairments:${process.env.DISCORD_APP_ID}`, key);
};
