import { validateOptions } from '@fallencodes/seyfert-utils/options';
import { AnyContext, CommandContext, OnOptionsReturnObject } from 'seyfert';
import { removeReaction } from './common.js';

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
