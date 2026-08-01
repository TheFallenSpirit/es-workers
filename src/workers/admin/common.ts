import { AnyContext } from 'seyfert';

export async function removeReaction(context: AnyContext) {
    if (!context.isChat() || !context.message) return;
    const reaction = context.message.reactions?.[0];

    if (reaction) await context.client.reactions.delete(
        context.message.id,
        context.channelId,
        reaction.emoji
    ).catch(() => {});
};
