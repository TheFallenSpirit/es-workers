import { Command, CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { redis } from '../../../store/index.js';

const options = {
    'interaction-id': createStringOption({
        required: true,
        description: 'The ID of the command or interaction to toggle.'
    }),
    reason: createStringOption({
        description: 'The reason for disabling the interaction.'
    })
};

@Declare({
    name: 'toggle',
    description: 'Toggle the active state of an interaction.',
    props: { permissionLevel: 7 }
})

@Options(options)

export default class extends Command {
    run = async (context: CommandContext<typeof options>) => {
        const id = context.options['interaction-id'].trim();
        const reason = context.options.reason?.trim();

        if (reason) await redis.set(`es_interaction_disabled:${id}`, reason);
        else await redis.del(`es_interaction_disabled:${id}`);

        await context.editOrReply({ content: `${reason ? 'Disabled' : 'Enabled'} interaction \`${id}\`.` });
    };
};
