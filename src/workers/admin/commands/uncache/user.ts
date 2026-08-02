import { CommandContext, createUserOption, Declare, Options, SubCommand } from 'seyfert';
import { redis } from '../../../../store/index.js';

const options = {
    user: createUserOption({
        required: true,
        description: 'The user to clear cached data from.'
    })
};

@Declare({
    name: 'user',
    aliases: ['u'],
    description: `Clear a user's data from the cache.`
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const user = context.options.user;
        await redis.del(`es_profile:${user.id}`);
        await context.editOrReply({ content: `Cleared cache data from @${user.username}.` });
    };
};
