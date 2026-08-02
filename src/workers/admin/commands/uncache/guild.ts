import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';
import { redis } from '../../../../store/index.js';

const options = {
    'guild-id': createStringOption({
        required: true,
        min_length: 17,
        max_length: 19,
        description: 'The guild ID to clear cached data from.'
    })
};

@Declare({
    name: 'guild',
    aliases: ['g'],
    description: `Clear a guild's data from the cache.`
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const guildId = context.options['guild-id'];
        const guild = await context.client.guilds.fetch(guildId).catch(() => undefined);

        if (!guild) {
            const isCached = await redis.exists(`es_guild:${guildId}`) === 1;
            if (!isCached) return context.editOrReply({ content: `guild isn't cached or using the bot.` });
        };

        await redis.del(`es_guild:${guildId}`);
        await context.editOrReply({ content: `Cleared cached data from ${guild?.name ?? `\`${guildId}\``}.` });
    };
};
