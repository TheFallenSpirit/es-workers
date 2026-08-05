import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';
import { guildOption } from './partner.js';
import Partner from '../../../../common/models/Partner.js';
import { redis } from '../../../../store/index.js';
import { removeFromDiscovery } from '../../../cron/jobs/updateDiscoveryCache.js';
import queueMessage from '../../../../common/queue.js';
import emojis from '../../../../common/emojis.js';
import { s } from '@fallencodes/seyfert-utils';

const options = {
    'guild-id': guildOption,
    reason: createStringOption({
        required: true,
        description: 'The reason for denying the application.'
    })
};

@Declare({
    name: 'deny',
    description: 'Deny a pending Partner Program application.'
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        let partner = await Partner.findById(context.options['guild-id'].trim()).lean();
        if (!partner) return context.editOrReply({ content: `Partner profile not found.` });

        const guild = await context.client.guilds.fetch(partner._id).catch(() => undefined);
        if (!guild) return context.editOrReply({ content: `Guild not found with bot installed.` });

        partner = await Partner.findByIdAndUpdate(
            partner._id,
            { $set: { status: 'applicationDenied' } },
            { returnDocument: 'after' }
        ).lean();

        const pipeline = redis.pipeline();
        await removeFromDiscovery(partner!, pipeline);
        const reason = context.options.reason.trim();
        await pipeline.exec();

        if (partner?.application?.userId) await queueMessage('general', {
            userId: partner.application.userId,
            options: {
                content: `### ${emojis.warn} Your ES Partner Program application for ${guild.name} has been denied.\n>>> ${reason}`
            }
        });

        if (guild.ownerId !== partner?.application?.userId) await queueMessage('general', {
            userId: guild.ownerId,
            options: {
                content: `### ${emojis.warn} Your server ${guild.name}'s ES Partner Program application has been denied.\n>>> ${reason}`
            }
        });

        await context.editOrReply({ content: `Denied ${s(guild.name)}'s partner program application.` });
    };
};
