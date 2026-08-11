import { CommandContext, Declare, Options, SubCommand } from 'seyfert';
import { guildOption } from './partner.js';
import Partner from '../../../../common/models/Partner.js';
import { redis } from '../../../../store/index.js';
import { replacer, s } from '@fallencodes/seyfert-utils';
import queueMessage from '../../../../common/queue.js';

const config = {
    guildId: '1136148842715303946',
    partnerRoleId: '1462923162441482402',
    partnerChannelId: '1462924747519033455'
};

const options = {
    'guild-id': guildOption
};

@Declare({
    name: 'approve',
    description: 'Approve a pending Partner Program application.'
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        let partner = await Partner.findById(context.options['guild-id'].trim()).lean();
        if (!partner) return context.editOrReply({ content: `Partner profile not found.` });

        const guild = await context.client.guilds.fetch(partner._id).catch(() => undefined);
        if (!guild) return context.editOrReply({ content: `Guild not found with bot installed.` });
        if (!partner.representativeId) return context.editOrReply({ content: `No partner representative set.` });

        partner = await Partner.findByIdAndUpdate(
            partner._id,
            { $set: { status: 'active', 'discovery.public': false } },
            { returnDocument: 'after' }
        ).lean();

        await redis.set(`es_partner:${partner?._id}`, JSON.stringify(partner, replacer));
        const manageText = `You can manage your partner profile using </guildctl partner:1289666783602802735>.`;

        if (partner?.application?.userId) await queueMessage('general', {
            userId: partner.application.userId,
            options: {
                content: `### :tada: Your ES Partner Program application for ${guild.name} has been approved.\n${manageText}`
            }
        });

        if (guild.ownerId !== partner?.application?.userId) await queueMessage('general', {
            userId: guild.ownerId,
            options: {
                content: `### :tada: Your server ${guild.name}'s ES Partner Program application has been approved.\n${manageText}`
            }
        });

        const esMember = await context.client.members.fetch(config.guildId, partner?.representativeId!).catch(() => undefined);
        if (esMember && !esMember.roles.keys.includes(config.partnerRoleId)) {
            await context.client.proxy.guilds(config.guildId).members(partner?.representativeId!).roles(config.partnerRoleId).put({
                reason: `Automated Action: User set as partner rep for ${guild.name} [${guild.id}]`
            });
        };

        const lines = [
            `<@${partner?.representativeId}> has been added as the partner representative for`,
            ` ${s(guild.name!)} [\`${guild.id}\`] :tada:`
        ];

        await context.client.messages.write(config.partnerChannelId, { content: lines.join('') });
        await context.editOrReply({ content: `Approved ${s(guild.name)}'s partner program application.` });
    };
};
