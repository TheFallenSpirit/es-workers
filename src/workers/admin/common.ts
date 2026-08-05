import { validateOptions } from '@fallencodes/seyfert-utils/options';
import { AnyContext, CommandContext, OnOptionsReturnObject } from 'seyfert';

export async function removeReaction(context: AnyContext) {
    if (!context.isChat() || !context.message) return;
    const reaction = context.message.reactions?.[0];

    if (reaction) await context.client.reactions.delete(
        context.message.id,
        context.channelId,
        reaction.emoji
    ).catch(() => {});
};

export async function onAfterRun(context: AnyContext) {
    await removeReaction(context);
};

export async function onOptionsError(context: CommandContext, metadata: OnOptionsReturnObject) {
    const lines = [];
    const errors = await validateOptions(metadata);

    if (errors.length === 1) lines.push(`${errors[0]}`); else lines.push(
        `The following errors were found with your command usage:\n`,
        errors.map((e) => `- ${e}`).join('\n')
    );

    await context.editOrReply({ content: lines.join('') });
    await removeReaction(context);
};
