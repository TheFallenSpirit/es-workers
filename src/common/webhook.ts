import { ApiHandler, RESTPatchAPIWebhookWithTokenMessageJSONBody } from 'seyfert';
import { redis } from '../store/index.js';

const proxy = new ApiHandler({
    token: process.env.DISCORD_TOKEN!
}).proxy;

export async function editWebhookMessage(channelId: string, messageId: string, options: RESTPatchAPIWebhookWithTokenMessageJSONBody) {
    const cachedWebhook = await redis.get(`es_webhook:${channelId}`);

    if (cachedWebhook) {
        const { id, token } = JSON.parse(cachedWebhook);
        return await apiEditWebhookMessage(id!, token!, messageId, options).catch(() => {})
    };

    const webhook = await getWebhookFromApi(channelId);
    if (!webhook) return;

    await redis.set(`es_webhook:${channelId}`, JSON.stringify({ id: webhook.id, token: webhook.token }));
    await apiEditWebhookMessage(webhook.id, webhook.token!, messageId, options).catch(() => {});
};

async function getWebhookFromApi(channelId: string) {
    const webhooks = await proxy.channels(channelId).webhooks.get().catch(() => undefined);
    return webhooks?.find(({ application_id }) => application_id === process.env.DISCORD_APP_ID);
};

async function apiEditWebhookMessage(id: string, token: string, messageId: string, options: RESTPatchAPIWebhookWithTokenMessageJSONBody) {
    await proxy.webhooks(id)(token).messages(messageId).patch({ body: options });
};
