import { CronOnCompleteCallback } from 'cron';
import dayjs from 'dayjs';
import { redis } from '../../../store/index.js';
import { getProfile } from '../../../store/profile.js';
import { getGuild } from '../../../store/guild.js';
import { createActionRow, createButton } from '@fallencodes/seyfert-utils/components/message';
import { ButtonStyle } from 'seyfert';
import { editWebhookMessage } from '../../../common/webhook.js';

export default async (done: CronOnCompleteCallback) => {
    const now = dayjs.utc();
    const pipeline = redis.multi();
    const gagMessageIds = await redis.smembers(`es_gag_message_list`);

    for await (const messageId of gagMessageIds) {
        const rawGagMessage = await redis.get(`es_gag_message:${messageId}`);

        if (!rawGagMessage) {
            pipeline.srem(`es_gag_message_list`, messageId);
            continue;
        };

        const gagMessage = JSON.parse(rawGagMessage) as CachedGagMessage;
        if (now.isBefore(gagMessage.expiresAt)) continue;

        const editRequest = {};
        if (gagMessage.reference) Object.assign(editRequest, {
            components: [createActionRow(createButton({
                url: gagMessage.reference.link,
                style: ButtonStyle.Link,
                label: gagMessage.reference.authorName,
                emoji: { id: '1210144390329143306', name: 'es_reply' },
            }))]
        });

        let showOriginalContentOnPeekExpire = false;
        const guild = await getGuild(gagMessage.guildId);
        if (guild?.showOriginalContentOnPeekExpire) showOriginalContentOnPeekExpire = true;

        const profile = await getProfile(gagMessage.authorId);
        if (profile?.impairmentsConfig?.showOriginalContentOnPeekExpire === 'enabled') showOriginalContentOnPeekExpire = true;
        if (profile?.impairmentsConfig?.showOriginalContentOnPeekExpire === 'disabled') showOriginalContentOnPeekExpire = false;

        if (showOriginalContentOnPeekExpire && gagMessage.newMessageId) {
            Object.assign(editRequest, { content: gagMessage.content });
            await editWebhookMessage(gagMessage.channelId, gagMessage.newMessageId, editRequest);
        };

        pipeline.del(`es_gag_message:${messageId}`);
        pipeline.srem(`es_gag_message_list`, messageId);
    };

    await pipeline.exec();
    done();
};

interface CachedGagMessage {
    content: string;
    guildId: string;
    authorId: string;
    channelId: string;
    expiresAt: string;
    newMessageId?: string;
    reference?: {
        link: string;
        authorName: string;
    };
}
