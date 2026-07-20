import { Job } from 'bullmq';
import rest from '../../common/rest.js';
import { redis } from '../../store/index.js';
import { getProfile } from '../../store/profile.js';
import { seconds } from 'itty-time';
import { MessageQueueItem } from '../../common/types.js';

export default async function messageJob(job: Job<MessageQueueItem, any, string>, queue: 'general' | 'billing') {
    if (job.name !== 'direct-message') return;

    if (queue !== 'billing') {
        const isBlocked = await redis.exists(`es_dm_block:${job.data.userId}`);
        if (isBlocked === 1) return;

        const profile = await getProfile(job.data.userId);
        if (job.data.notificationType && profile?.disabledNotifications?.includes(job.data.notificationType)) return;
    };

    let channelId: string | undefined;
    const redisChannelId = await redis.get(`es_dm_channel:${job.data.userId}`);
    if (redisChannelId) channelId = redisChannelId;

    try {
        const dmChannel = await rest.users('@me').channels.post({ body: { recipient_id: job.data.userId } });
        channelId = dmChannel.id;
    } catch (_error) {
        return;
    };

    if (!redisChannelId) await redis.set(`es_dm_channel:${job.data.userId}`, channelId, 'EX', seconds('1 month'));
    await rest.channels(channelId).messages.post({ body: job.data.options }).catch(async () => {
        await redis.set(`es_dm_block:${job.data.userId}`, 'true', 'EX', seconds('1 week'));
    });
};
