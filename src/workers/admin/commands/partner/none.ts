import { CommandContext, Declare, Options, SubCommand } from 'seyfert';
import { guildOption } from './partner.js';
import Partner from '../../../../common/models/Partner.js';
import { removeFromDiscovery } from '../../../cron/jobs/updateDiscoveryCache.js';
import { redis } from '../../../../store/index.js';
import { s } from '@fallencodes/seyfert-utils';

const options = {
    'guild-id': guildOption
};

@Declare({
    name: 'none',
    description: `Clear a server's partner status.`
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        let partner = await Partner.findById(context.options['guild-id'].trim()).lean();
        if (!partner) return context.editOrReply({ content: `Partner profile not found.` });

        partner = await Partner.findByIdAndUpdate(
            partner._id,
            { $set: { status: 'none', 'discovery.public': false } },
            { returnDocument: 'after' }
        ).lean();
        
        const pipeline = redis.pipeline();
        await removeFromDiscovery(partner!, pipeline);
        await pipeline.exec();

        const guild = await context.client.guilds.fetch(partner!._id).catch(() => undefined);
        await context.editOrReply({ content: `Cleared ${s(guild?.name ?? 'unknown server')}'s partner status.` });
    };
};
