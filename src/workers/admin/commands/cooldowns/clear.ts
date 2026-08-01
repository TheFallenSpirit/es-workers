import { CommandContext, createUserOption, Declare, Options, SubCommand } from 'seyfert';
import { redis } from '../../../../store/index.js';

const options = {
    user: createUserOption({
        required: false,
        description: ''
    })
};

@Declare({
    name: 'clear',
    description: `Clear all of a user's interaction cooldowns.`,
    props: { permissionLevel: 5 }
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const user = context.options.user ?? context.author;
        const keys = await redis.keys(`es_cooldown_int:*:${user.id}`);

        if (keys.length > 0) await redis.del(keys);
        await context.editOrReply({ content: `Cleared ${keys.length} cooldowns for @${user.username}.` });
    };
};
