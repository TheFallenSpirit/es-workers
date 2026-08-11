import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';
import { guildOption } from './partner.js';
import Partner from '../../../../common/models/Partner.js';
import { removeFromDiscovery } from '../../../cron/jobs/updateDiscoveryCache.js';
import { redis } from '../../../../store/index.js';
import queueMessage from '../../../../common/queue.js';
import emojis from '../../../../common/emojis.js';
import { s } from '@fallencodes/seyfert-utils';

const options = {
    'guild-id': guildOption,
    reason: createStringOption({
        required: true,
        description: 'The reason for revoking partner access.'
    })
};

@Declare({
    name: 'revoke',
    description: `Revoke an active server's Partner Program access.`
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        let partner = await Partner.findById(context.options['guild-id'].trim()).lean();
        if (!partner) return context.editOrReply({ content: `Partner profile not found.` });

        partner = await Partner.findByIdAndUpdate(
            partner._id,
            { $set: { status: 'revoked', 'discovery.public': false } },
            { returnDocument: 'after' }
        ).lean();

        const pipeline = redis.pipeline();
        await removeFromDiscovery(partner!, pipeline);
        await pipeline.exec();

        const guild = await context.client.guilds.fetch(partner!._id).catch(() => undefined);
        const reason = context.options.reason.trim();

        if (guild?.ownerId) await queueMessage('general', {
            userId: guild.ownerId,
            options: {
                content: `### ${emojis.warn} Your server ${guild.name}'s ES Partner Program status has been revoked.\n>>> ${reason}`
            }
        });

        await context.editOrReply({ content: `Revoked ${s(guild?.name ?? 'unknown guild')}'s partner access.` });
    };
};
